// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HustlReputation
 * @notice Immutable on-chain reputation ledger for Hustl3.
 *         Every completed order writes a verifiable rating entry.
 *         Reputation documents in 0G Storage are hashed here for trustless verification.
 */
contract HustlReputation is Ownable {

    struct ReputationEvent {
        string  orderId;
        address rater;
        uint8   rating;      // 1–5
        uint64  timestamp;
        bytes32 metadataHash; // hash of full review doc in 0G Storage
    }

    struct Endorsement {
        address endorser;
        string  skillName;
        uint64  timestamp;
        string  comment;
    }

    mapping(address => ReputationEvent[]) private reputationHistory;
    mapping(address => Endorsement[])     private endorsements;
    mapping(address => bool)              public authorizedOperators;

    // Aggregate cache (updated on each write for gas-efficient reads)
    mapping(address => uint256) public totalRatingSum;
    mapping(address => uint256) public totalRatingCount;

    event ReputationRecorded(
        address indexed subject,
        address indexed rater,
        string  orderId,
        uint8   rating,
        bytes32 metadataHash
    );
    event AgentEndorsed(
        address indexed subject,
        address indexed endorser,
        string  skillName
    );

    error Reputation__Unauthorized();
    error Reputation__InvalidRating();
    error Reputation__SelfRating();
    error Reputation__SelfEndorsement();

    modifier onlyOperator() {
        if (!authorizedOperators[msg.sender] && msg.sender != owner()) {
            revert Reputation__Unauthorized();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedOperators[initialOwner] = true;
    }

    /**
     * @notice Record a reputation event. Called by the Hustl3 backend operator after order completion.
     */
    function recordReputation(
        address subject,
        address rater,
        string  calldata orderId,
        uint8   rating,
        bytes32 metadataHash
    ) external onlyOperator {
        if (rating < 1 || rating > 5) revert Reputation__InvalidRating();
        if (subject == rater) revert Reputation__SelfRating();

        reputationHistory[subject].push(ReputationEvent({
            orderId:      orderId,
            rater:        rater,
            rating:       rating,
            timestamp:    uint64(block.timestamp),
            metadataHash: metadataHash
        }));

        totalRatingSum[subject]   += rating;
        totalRatingCount[subject] += 1;

        emit ReputationRecorded(subject, rater, orderId, rating, metadataHash);
    }

    /**
     * @notice Get weighted average reputation score (0–500, divide by 100 for 0.00–5.00).
     *         Most recent 10 ratings are weighted 2x compared to older ones.
     */
    function getReputationScore(address subject) external view returns (uint256 score, uint256 count) {
        ReputationEvent[] storage history = reputationHistory[subject];
        count = history.length;
        if (count == 0) return (0, 0);

        uint256 weightedSum   = 0;
        uint256 totalWeight   = 0;
        uint256 recentCutoff  = count > 10 ? count - 10 : 0;

        for (uint256 i = 0; i < count; i++) {
            uint256 weight = (i >= recentCutoff) ? 2 : 1;
            weightedSum  += uint256(history[i].rating) * weight * 100;
            totalWeight  += weight;
        }

        score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    }

    /**
     * @notice Retrieve all reputation events for an address.
     */
    function getReputationHistory(address subject)
        external
        view
        returns (ReputationEvent[] memory)
    {
        return reputationHistory[subject];
    }

    /**
     * @notice Retrieve recent N reputation events (most recent first).
     */
    function getRecentReputation(address subject, uint256 n)
        external
        view
        returns (ReputationEvent[] memory result)
    {
        ReputationEvent[] storage history = reputationHistory[subject];
        uint256 len  = history.length;
        uint256 take = n < len ? n : len;
        result = new ReputationEvent[](take);
        for (uint256 i = 0; i < take; i++) {
            result[i] = history[len - 1 - i];
        }
    }

    /**
     * @notice One agent endorses another agent's skill — builds agent-to-agent trust graph.
     */
    function endorseAgent(
        address subject,
        string  calldata skillName,
        string  calldata comment
    ) external {
        if (subject == msg.sender) revert Reputation__SelfEndorsement();
        endorsements[subject].push(Endorsement({
            endorser:  msg.sender,
            skillName: skillName,
            timestamp: uint64(block.timestamp),
            comment:   comment
        }));
        emit AgentEndorsed(subject, msg.sender, skillName);
    }

    /**
     * @notice Get all endorsements for an address.
     */
    function getEndorsements(address subject) external view returns (Endorsement[] memory) {
        return endorsements[subject];
    }

    function setAuthorizedOperator(address operator, bool authorized) external onlyOwner {
        authorizedOperators[operator] = authorized;
    }
}
