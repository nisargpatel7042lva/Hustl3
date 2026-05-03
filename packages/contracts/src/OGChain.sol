// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ─────────────────────────────────────────────────────────────────────────────
// 1. DA Precompile Interface (0G Chain natively supports this at 0x1000)
// ─────────────────────────────────────────────────────────────────────────────
interface IDAPrecompile {
    function submitBlob(bytes calldata data) external returns (bytes32 commitment);
    function verifyBlob(bytes32 commitment, bytes32 blobHash) external view returns (bool valid);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Wrapped OG Token (WOGAI) with DA-anchored proof
// ─────────────────────────────────────────────────────────────────────────────
contract OGWrappedToken is ERC20, Ownable, ReentrancyGuard {
    IDAPrecompile public immutable DA_PRECOMPILE;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event DAnchoredDeposit(address indexed from, uint256 amount, bytes32 daCommitment);

    error WOGAI__InvalidAmount();
    error WOGAI__WithdrawFailed();

    constructor(address initialOwner)
        ERC20("Wrapped OG", "WOGAI")
        Ownable(initialOwner)
    {
        // 0G Chain DA precompile deterministic address
        DA_PRECOMPILE = IDAPrecompile(0x0000000000000000000000000000000000001000);
    }

    receive() external payable {
        _deposit(msg.sender);
    }

    function deposit() external payable nonReentrant {
        _deposit(msg.sender);
    }

    // Anchor deposit proof to DA layer for institutional auditability
    function depositWithDAProof(bytes calldata anchorData) external payable nonReentrant returns (bytes32 commitment) {
        if (msg.value == 0) revert WOGAI__InvalidAmount();
        
        commitment = DA_PRECOMPILE.submitBlob(anchorData);
        _mint(msg.sender, msg.value);
        
        emit Deposit(msg.sender, msg.value);
        emit DAnchoredDeposit(msg.sender, msg.value, commitment);
    }

    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert WOGAI__InvalidAmount();
        _burn(msg.sender, amount);
        (bool ok, ) = payable(msg.sender).call{value: amount}("");
        if (!ok) revert WOGAI__WithdrawFailed();
        emit Withdrawal(msg.sender, amount);
    }

    function _deposit(address recipient) internal {
        if (msg.value == 0) revert WOGAI__InvalidAmount();
        _mint(recipient, msg.value);
        emit Deposit(recipient, msg.value);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. OGChainDA — DA Submission + On-Chain Settlement
// ─────────────────────────────────────────────────────────────────────────────
contract OGChainDA is Ownable, ReentrancyGuard {
    IDAPrecompile public immutable DA_PRECOMPILE;

    struct BlobRecord {
        bytes32 commitment;
        bytes32 blobHash;
        address submitter;
        uint64  blockNumber;
        string  tag;
    }

    mapping(bytes32 => BlobRecord) public blobs;

    event BlobSubmitted(bytes32 indexed commitment, address indexed submitter, string tag);

    constructor(address initialOwner) Ownable(initialOwner) {
        DA_PRECOMPILE = IDAPrecompile(0x0000000000000000000000000000000000001000);
    }

    function submitDABlob(bytes calldata data, string calldata tag)
        external
        nonReentrant
        returns (bytes32 commitment)
    {
        bytes32 blobHash = keccak256(data);
        commitment = DA_PRECOMPILE.submitBlob(data);

        blobs[commitment] = BlobRecord({
            commitment:  commitment,
            blobHash:    blobHash,
            submitter:   msg.sender,
            blockNumber: uint64(block.number),
            tag:         tag
        });

        emit BlobSubmitted(commitment, msg.sender, tag);
    }
}
