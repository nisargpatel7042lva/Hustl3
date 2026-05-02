// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

error Escrow__OrderNotFound();
error Escrow__OrderAlreadyExists();
error Escrow__InvalidStatus();
error Escrow__Unauthorized();
error Escrow__DeadlineNotPassed();
error Escrow__TransferFailed();
error Escrow__SelfTransaction();

enum OrderStatus {
    Created,
    Delivered,
    Approved,
    Disputed,
    Released,
    Refunded
}

struct Order {
    string orderId;
    address buyer;
    address seller;
    address token;
    uint256 amount;
    OrderStatus status;
    uint256 deadline;
    uint256 deliveredAt;
    string disputeReason;
}

abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;

    constructor() {
        _status = NOT_ENTERED;
    }

    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
}

abstract contract Pausable {
    bool private _paused;

    constructor() {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }

    function paused() public view virtual returns (bool) {
        return _paused;
    }

    function _pause() internal virtual {
        _paused = true;
    }

    function _unpause() internal virtual {
        _paused = false;
    }
}

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Hustl3Escrow is ReentrancyGuard, Pausable {
    mapping(string => Order) public orders;
    mapping(string => bool) public orderExists;
    mapping(address => bool) public authorizedContracts;

    uint256 public constant DISPUTE_WINDOW = 7 days;
    uint256 public constant AUTO_RELEASE_DELAY = 3 days;

    event OrderCreated(
        string orderId,
        address indexed buyer,
        address indexed seller,
        address token,
        uint256 amount,
        uint256 deadline
    );

    event OrderDelivered(
        string orderId,
        uint256 deliveredAt
    );

    event OrderApproved(
        string orderId,
        uint256 releasedAt
    );

    event DisputeRaised(
        string orderId,
        address indexed raisedBy,
        string reason,
        uint256 timestamp
    );

    event OrderRefunded(
        string orderId,
        uint256 refundedAt
    );

    event OrderReleased(
        string orderId,
        uint256 releasedAt
    );

    modifier onlyBuyer(string memory orderId) {
        if (msg.sender != orders[orderId].buyer) revert Escrow__Unauthorized();
        _;
    }

    modifier onlySeller(string memory orderId) {
        if (msg.sender != orders[orderId].seller) revert Escrow__Unauthorized();
        _;
    }

    modifier onlyAuthorized() {
        if (!authorizedContracts[msg.sender]) revert Escrow__Unauthorized();
        _;
    }

    modifier orderMustExist(string memory orderId) {
        if (!orderExists[orderId]) revert Escrow__OrderNotFound();
        _;
    }

    modifier orderMustNotExist(string memory orderId) {
        if (orderExists[orderId]) revert Escrow__OrderAlreadyExists();
        _;
    }

    constructor() {
        authorizedContracts[msg.sender] = true;
    }

    function createOrder(
        string calldata orderId,
        address seller,
        address token,
        uint256 amount
    )
        external
        payable
        whenNotPaused
        orderMustNotExist(orderId)
        nonReentrant
    {
        if (seller == address(0)) revert Escrow__InvalidStatus();
        if (seller == msg.sender) revert Escrow__SelfTransaction();
        if (amount == 0) revert Escrow__InvalidStatus();
        
        if (token == address(0)) {
            if (msg.value != amount) revert Escrow__InvalidStatus();
        }

        uint256 deadline = block.timestamp + DISPUTE_WINDOW;

        orders[orderId] = Order({
            orderId: orderId,
            buyer: msg.sender,
            seller: seller,
            token: token,
            amount: amount,
            status: OrderStatus.Created,
            deadline: deadline,
            deliveredAt: 0,
            disputeReason: ""
        });
        orderExists[orderId] = true;

        emit OrderCreated(orderId, msg.sender, seller, token, amount, deadline);
    }

    function createOrderForAI(
        string calldata orderId,
        address buyer,
        address seller,
        address token,
        uint256 amount
    )
        external
        payable
        whenNotPaused
        onlyAuthorized
        orderMustNotExist(orderId)
        nonReentrant
    {
        if (buyer == address(0) || seller == address(0) || amount == 0) revert Escrow__InvalidStatus();
        
        if (token == address(0)) {
            if (msg.value != amount) revert Escrow__InvalidStatus();
        }

        uint256 deadline = block.timestamp + DISPUTE_WINDOW;

        orders[orderId] = Order({
            orderId: orderId,
            buyer: buyer,
            seller: seller,
            token: token,
            amount: amount,
            status: OrderStatus.Created,
            deadline: deadline,
            deliveredAt: 0,
            disputeReason: ""
        });
        orderExists[orderId] = true;

        emit OrderCreated(orderId, buyer, seller, token, amount, deadline);
    }

    function createOrderWithToken(
        string calldata orderId,
        address seller,
        address token,
        uint256 amount
    )
        external
        whenNotPaused
        orderMustNotExist(orderId)
        nonReentrant
    {
        if (seller == address(0) || token == address(0) || amount == 0) revert Escrow__InvalidStatus();
        if (seller == msg.sender) revert Escrow__SelfTransaction();

        bool success = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!success) revert Escrow__TransferFailed();

        uint256 deadline = block.timestamp + DISPUTE_WINDOW;

        orders[orderId] = Order({
            orderId: orderId,
            buyer: msg.sender,
            seller: seller,
            token: token,
            amount: amount,
            status: OrderStatus.Created,
            deadline: deadline,
            deliveredAt: 0,
            disputeReason: ""
        });
        orderExists[orderId] = true;

        emit OrderCreated(orderId, msg.sender, seller, token, amount, deadline);
    }

    function markDelivered(string calldata orderId)
        external
        orderMustExist(orderId)
        onlySeller(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.Created) {
            revert Escrow__InvalidStatus();
        }

        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;

        emit OrderDelivered(orderId, block.timestamp);
    }

    function approveRelease(string calldata orderId)
        external
        orderMustExist(orderId)
        onlyBuyer(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.Delivered && order.status != OrderStatus.Created) {
            revert Escrow__InvalidStatus();
        }

        order.status = OrderStatus.Approved;

        _releaseFunds(orderId);

        emit OrderApproved(orderId, block.timestamp);
    }

    function autoReleaseAfterDeadline(string calldata orderId)
        external
        orderMustExist(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.Delivered) {
            revert Escrow__InvalidStatus();
        }

        if (block.timestamp < order.deliveredAt + AUTO_RELEASE_DELAY) {
            revert Escrow__DeadlineNotPassed();
        }

        order.status = OrderStatus.Released;

        _releaseFunds(orderId);

        emit OrderReleased(orderId, block.timestamp);
    }

    function refundBuyer(string calldata orderId)
        external
        orderMustExist(orderId)
        onlyBuyer(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.Created) {
            revert Escrow__InvalidStatus();
        }

        if (block.timestamp >= order.deadline) {
            revert Escrow__InvalidStatus();
        }

        order.status = OrderStatus.Refunded;

        _refundBuyer(orderId);

        emit OrderRefunded(orderId, block.timestamp);
    }

    function raiseDispute(string calldata orderId, string calldata reason)
        external
        orderMustExist(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (msg.sender != order.buyer && msg.sender != order.seller) {
            revert Escrow__Unauthorized();
        }

        if (order.status != OrderStatus.Delivered && order.status != OrderStatus.Created) {
            revert Escrow__InvalidStatus();
        }

        order.status = OrderStatus.Disputed;
        order.disputeReason = reason;

        emit DisputeRaised(orderId, msg.sender, reason, block.timestamp);
    }

    function resolveDispute(string calldata orderId, bool releaseToSeller)
        external
        onlyAuthorized
        orderMustExist(orderId)
        nonReentrant
    {
        Order storage order = orders[orderId];

        if (order.status != OrderStatus.Disputed) {
            revert Escrow__InvalidStatus();
        }

        if (releaseToSeller) {
            order.status = OrderStatus.Released;
            _releaseFunds(orderId);
            emit OrderReleased(orderId, block.timestamp);
        } else {
            order.status = OrderStatus.Refunded;
            _refundBuyer(orderId);
            emit OrderRefunded(orderId, block.timestamp);
        }
    }

    function _releaseFunds(string memory orderId) internal {
        Order storage order = orders[orderId];

        if (order.token == address(0)) {
            (bool success, ) = payable(order.seller).call{value: order.amount}("");
            if (!success) revert Escrow__TransferFailed();
        } else {
            bool success = IERC20(order.token).transfer(order.seller, order.amount);
            if (!success) revert Escrow__TransferFailed();
        }
    }

    function _refundBuyer(string memory orderId) internal {
        Order storage order = orders[orderId];

        if (order.token == address(0)) {
            (bool success, ) = payable(order.buyer).call{value: order.amount}("");
            if (!success) revert Escrow__TransferFailed();
        } else {
            bool success = IERC20(order.token).transfer(order.buyer, order.amount);
            if (!success) revert Escrow__TransferFailed();
        }
    }

    function getOrder(string memory orderId)
        external
        view
        orderMustExist(orderId)
        returns (
            string memory,
            address,
            address,
            address,
            uint256,
            uint256,
            OrderStatus,
            uint256,
            string memory
        )
    {
        Order storage order = orders[orderId];
        return (
            order.orderId,
            order.buyer,
            order.seller,
            order.token,
            order.amount,
            order.deadline,
            order.status,
            order.deliveredAt,
            order.disputeReason
        );
    }

    function setAuthorizedContract(address contractAddress, bool authorized) external {
        authorizedContracts[contractAddress] = authorized;
    }

    function pause() external onlyAuthorized {
        _pause();
    }

    function unpause() external onlyAuthorized {
        _unpause();
    }

    receive() external payable {}
}