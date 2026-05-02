// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HustlEscrow
 * @notice Financial heart of Hustl3. Every order creates an escrow position.
 *         Supports native ETH and ERC-20 tokens.
 *         Integrates with KeeperHub via events for guaranteed execution callbacks.
 */
contract HustlEscrow is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    enum EscrowState { LOCKED, RELEASED, REFUNDED, DISPUTED }

    struct Escrow {
        string    orderId;
        address   buyer;
        address   seller;
        address   token;        // address(0) = native ETH
        uint256   amount;
        EscrowState state;
        uint64    createdAt;
        uint64    expiresAt;    // auto-refund deadline if seller never delivers
        uint64    deliveredAt;  // set by backend when delivery confirmed
        uint64    disputeWindowEnd;
        string    keeperHubJobId;
    }

    address public arbitrator;
    uint256 public constant DISPUTE_WINDOW    = 3 days;
    uint256 public constant AUTO_REFUND_DELAY = 7 days;
    uint256 public constant DELIVERY_WINDOW   = 14 days;

    mapping(string => Escrow) public escrows;
    mapping(string => bool)   public escrowExists;
    mapping(address => bool)  public authorizedBackends;

    // ─── Events ────────────────────────────────────────────────────────────────

    event EscrowCreated(
        string indexed orderId,
        address indexed buyer,
        address indexed seller,
        address token,
        uint256 amount,
        uint64  expiresAt,
        string  keeperHubJobId
    );
    event EscrowDelivered(string indexed orderId, uint64 deliveredAt);
    event EscrowReleased(string indexed orderId, address indexed to, uint256 amount);
    event EscrowRefunded(string indexed orderId, address indexed to, uint256 amount);
    event DisputeRaised(string indexed orderId, address indexed raisedBy, uint64 disputeWindowEnd);
    event DisputeResolved(string indexed orderId, bool releasedToSeller, address resolver);
    // KeeperHub monitors this event for guaranteed execution callbacks
    event KeeperTaskRequired(string indexed orderId, string taskType, string keeperHubJobId);

    // ─── Errors ────────────────────────────────────────────────────────────────

    error Escrow__NotFound();
    error Escrow__AlreadyExists();
    error Escrow__InvalidState();
    error Escrow__Unauthorized();
    error Escrow__SelfTransaction();
    error Escrow__InvalidAmount();
    error Escrow__DeadlineNotPassed();
    error Escrow__DisputeWindowClosed();
    error Escrow__DisputeWindowOpen();
    error Escrow__NativeTransferFailed();

    // ─── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyArbitrator() {
        if (msg.sender != arbitrator && msg.sender != owner()) revert Escrow__Unauthorized();
        _;
    }

    modifier onlyAuthorizedBackend() {
        if (!authorizedBackends[msg.sender] && msg.sender != owner()) revert Escrow__Unauthorized();
        _;
    }

    modifier escrowMustExist(string calldata orderId) {
        if (!escrowExists[orderId]) revert Escrow__NotFound();
        _;
    }

    modifier inState(string calldata orderId, EscrowState expected) {
        if (escrows[orderId].state != expected) revert Escrow__InvalidState();
        _;
    }

    // ─── Constructor ───────────────────────────────────────────────────────────

    constructor(address initialOwner, address _arbitrator) Ownable(initialOwner) {
        arbitrator = _arbitrator;
        authorizedBackends[initialOwner] = true;
    }

    // ─── Core Escrow Functions ─────────────────────────────────────────────────

    /**
     * @notice Create an ETH escrow. Buyer sends ETH with this call.
     * @param keeperHubJobId The KeeperHub job ID for guaranteed execution tracking.
     */
    function createEscrowETH(
        string  calldata orderId,
        address seller,
        string  calldata keeperHubJobId
    ) external payable whenNotPaused nonReentrant {
        if (escrowExists[orderId]) revert Escrow__AlreadyExists();
        if (seller == address(0) || seller == msg.sender) revert Escrow__SelfTransaction();
        if (msg.value == 0) revert Escrow__InvalidAmount();

        _createEscrow(orderId, msg.sender, seller, address(0), msg.value, keeperHubJobId);
    }

    /**
     * @notice Create an ERC-20 token escrow. Buyer must approve this contract first.
     */
    function createEscrowToken(
        string  calldata orderId,
        address seller,
        address token,
        uint256 amount,
        string  calldata keeperHubJobId
    ) external whenNotPaused nonReentrant {
        if (escrowExists[orderId]) revert Escrow__AlreadyExists();
        if (seller == address(0) || seller == msg.sender) revert Escrow__SelfTransaction();
        if (token == address(0) || amount == 0) revert Escrow__InvalidAmount();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        _createEscrow(orderId, msg.sender, seller, token, amount, keeperHubJobId);
    }

    /**
     * @notice Backend-initiated escrow (for agent-to-agent transactions via x402).
     */
    function createEscrowForAgent(
        string  calldata orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount,
        string  calldata keeperHubJobId
    ) external payable whenNotPaused onlyAuthorizedBackend nonReentrant {
        if (escrowExists[orderId]) revert Escrow__AlreadyExists();
        if (buyer == address(0) || seller == address(0) || buyer == seller) revert Escrow__SelfTransaction();

        if (token == address(0)) {
            if (msg.value != amount) revert Escrow__InvalidAmount();
        } else {
            if (amount == 0) revert Escrow__InvalidAmount();
            IERC20(token).safeTransferFrom(buyer, address(this), amount);
        }

        _createEscrow(orderId, buyer, seller, token, amount, keeperHubJobId);
    }

    /**
     * @notice Mark order as delivered. Called by authorized backend after delivery confirmed.
     *         Starts the dispute window.
     */
    function markDelivered(string calldata orderId)
        external
        onlyAuthorizedBackend
        escrowMustExist(orderId)
        inState(orderId, EscrowState.LOCKED)
        nonReentrant
    {
        Escrow storage e = escrows[orderId];
        e.deliveredAt      = uint64(block.timestamp);
        e.disputeWindowEnd = uint64(block.timestamp + DISPUTE_WINDOW);

        emit EscrowDelivered(orderId, uint64(block.timestamp));
        // Signal KeeperHub to schedule auto-release if no dispute
        emit KeeperTaskRequired(orderId, "AUTO_RELEASE_CHECK", e.keeperHubJobId);
    }

    /**
     * @notice Buyer approves delivery and releases funds to seller.
     */
    function releaseEscrow(string calldata orderId)
        external
        escrowMustExist(orderId)
        inState(orderId, EscrowState.LOCKED)
        nonReentrant
    {
        Escrow storage e = escrows[orderId];
        if (msg.sender != e.buyer && msg.sender != arbitrator && !authorizedBackends[msg.sender]) {
            revert Escrow__Unauthorized();
        }
        // If delivered, can release any time; if not yet delivered, only arbitrator/backend
        if (e.deliveredAt == 0 && !authorizedBackends[msg.sender] && msg.sender != arbitrator) {
            revert Escrow__InvalidState();
        }

        e.state = EscrowState.RELEASED;
        _transferFunds(e.seller, e.token, e.amount);

        emit EscrowReleased(orderId, e.seller, e.amount);
    }

    /**
     * @notice Refund buyer. Called by arbitrator or auto after expiry.
     */
    function refundEscrow(string calldata orderId)
        external
        escrowMustExist(orderId)
        nonReentrant
    {
        Escrow storage e = escrows[orderId];
        if (e.state != EscrowState.LOCKED && e.state != EscrowState.DISPUTED) {
            revert Escrow__InvalidState();
        }

        bool isArbitratorOrBackend = (msg.sender == arbitrator || authorizedBackends[msg.sender]);
        bool isExpired = (block.timestamp >= e.expiresAt);
        bool isBuyerRefund = (msg.sender == e.buyer && e.deliveredAt == 0 && block.timestamp < e.expiresAt);

        if (!isArbitratorOrBackend && !isExpired && !isBuyerRefund) {
            revert Escrow__Unauthorized();
        }

        e.state = EscrowState.REFUNDED;
        _transferFunds(e.buyer, e.token, e.amount);

        emit EscrowRefunded(orderId, e.buyer, e.amount);
    }

    /**
     * @notice Raise a dispute. Callable by buyer or seller during dispute window.
     */
    function raiseDispute(string calldata orderId)
        external
        escrowMustExist(orderId)
        inState(orderId, EscrowState.LOCKED)
        nonReentrant
    {
        Escrow storage e = escrows[orderId];
        if (msg.sender != e.buyer && msg.sender != e.seller) revert Escrow__Unauthorized();
        // Must be within dispute window (after delivery)
        if (e.deliveredAt == 0) revert Escrow__InvalidState();
        if (block.timestamp > e.disputeWindowEnd) revert Escrow__DisputeWindowClosed();

        e.state = EscrowState.DISPUTED;
        emit DisputeRaised(orderId, msg.sender, e.disputeWindowEnd);
    }

    /**
     * @notice Arbitrator resolves a dispute.
     * @param releaseToSeller True = release funds to seller; False = refund buyer.
     */
    function resolveDispute(string calldata orderId, bool releaseToSeller)
        external
        onlyArbitrator
        escrowMustExist(orderId)
        inState(orderId, EscrowState.DISPUTED)
        nonReentrant
    {
        Escrow storage e = escrows[orderId];

        if (releaseToSeller) {
            e.state = EscrowState.RELEASED;
            _transferFunds(e.seller, e.token, e.amount);
            emit EscrowReleased(orderId, e.seller, e.amount);
        } else {
            e.state = EscrowState.REFUNDED;
            _transferFunds(e.buyer, e.token, e.amount);
            emit EscrowRefunded(orderId, e.buyer, e.amount);
        }

        emit DisputeResolved(orderId, releaseToSeller, msg.sender);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    function setArbitrator(address _arbitrator) external onlyOwner {
        arbitrator = _arbitrator;
    }

    function setAuthorizedBackend(address backend, bool authorized) external onlyOwner {
        authorizedBackends[backend] = authorized;
    }

    function pause()   external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }

    // ─── Internal ──────────────────────────────────────────────────────────────

    function _createEscrow(
        string  calldata orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount,
        string  calldata keeperHubJobId
    ) internal {
        uint64 exp = uint64(block.timestamp + DELIVERY_WINDOW);

        escrows[orderId] = Escrow({
            orderId:         orderId,
            buyer:           buyer,
            seller:          seller,
            token:           token,
            amount:          amount,
            state:           EscrowState.LOCKED,
            createdAt:       uint64(block.timestamp),
            expiresAt:       exp,
            deliveredAt:     0,
            disputeWindowEnd:0,
            keeperHubJobId:  keeperHubJobId
        });
        escrowExists[orderId] = true;

        emit EscrowCreated(orderId, buyer, seller, token, amount, exp, keeperHubJobId);
        emit KeeperTaskRequired(orderId, "ESCROW_CREATED", keeperHubJobId);
    }

    function _transferFunds(address to, address token, uint256 amount) internal {
        if (token == address(0)) {
            (bool ok,) = payable(to).call{value: amount}("");
            if (!ok) revert Escrow__NativeTransferFailed();
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    receive() external payable {}
}
