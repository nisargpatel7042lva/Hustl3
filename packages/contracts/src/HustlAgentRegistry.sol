// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HustlAgentRegistry
 * @notice On-chain registry of all AI agents on the Hustl3 platform.
 *         Used by other contracts to verify legitimate agents.
 *         Capability hashes point to skill manifests in 0G Storage.
 */
contract HustlAgentRegistry is Ownable {

    enum AgentType { SOLO, SWARM_COORDINATOR }

    struct Agent {
        address    walletAddress;
        address    ownerWallet;
        bytes32    ensNameHash;
        bytes32    capabilityHash;   // points to skill manifest in 0G Storage
        AgentType  agentType;
        uint64     createdAt;
        bool       active;
    }

    mapping(address => Agent)   public agents;
    mapping(address => bool)    public isRegistered;
    mapping(address => bool)    public authorizedBackends;
    address[]                   private agentList;

    event AgentRegistered(
        address indexed agentWallet,
        address indexed ownerWallet,
        bytes32 ensNameHash,
        bytes32 capabilityHash,
        AgentType agentType
    );
    event AgentDeactivated(address indexed agentWallet);
    event CapabilityHashUpdated(address indexed agentWallet, bytes32 newHash);

    error Registry__AlreadyRegistered();
    error Registry__NotRegistered();
    error Registry__Unauthorized();
    error Registry__InvalidInput();

    modifier onlyAgentOwnerOrBackend(address agentWallet) {
        if (
            agents[agentWallet].ownerWallet != msg.sender &&
            !authorizedBackends[msg.sender] &&
            msg.sender != owner()
        ) revert Registry__Unauthorized();
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        authorizedBackends[initialOwner] = true;
    }

    /**
     * @notice Register a new AI agent. Called by the backend after creating agent identity.
     */
    function registerAgent(
        address   agentWallet,
        address   ownerWallet,
        bytes32   ensNameHash,
        bytes32   capabilityHash,
        AgentType agentType
    ) external {
        if (isRegistered[agentWallet]) revert Registry__AlreadyRegistered();
        if (agentWallet == address(0) || ownerWallet == address(0)) revert Registry__InvalidInput();

        agents[agentWallet] = Agent({
            walletAddress:  agentWallet,
            ownerWallet:    ownerWallet,
            ensNameHash:    ensNameHash,
            capabilityHash: capabilityHash,
            agentType:      agentType,
            createdAt:      uint64(block.timestamp),
            active:         true
        });
        isRegistered[agentWallet] = true;
        agentList.push(agentWallet);

        emit AgentRegistered(agentWallet, ownerWallet, ensNameHash, capabilityHash, agentType);
    }

    /**
     * @notice Update capability hash when agent generates new skills.
     */
    function updateCapabilityHash(address agentWallet, bytes32 newHash)
        external
        onlyAgentOwnerOrBackend(agentWallet)
    {
        if (!isRegistered[agentWallet]) revert Registry__NotRegistered();
        if (newHash == bytes32(0)) revert Registry__InvalidInput();

        agents[agentWallet].capabilityHash = newHash;
        emit CapabilityHashUpdated(agentWallet, newHash);
    }

    /**
     * @notice Deactivate an agent.
     */
    function deactivateAgent(address agentWallet)
        external
        onlyAgentOwnerOrBackend(agentWallet)
    {
        if (!isRegistered[agentWallet]) revert Registry__NotRegistered();
        agents[agentWallet].active = false;
        emit AgentDeactivated(agentWallet);
    }

    /**
     * @notice Check if a wallet is a registered, active Hustl3 agent.
     *         Used by other contracts for access control.
     */
    function isRegisteredAgent(address agentWallet) external view returns (bool) {
        return isRegistered[agentWallet] && agents[agentWallet].active;
    }

    /**
     * @notice Return all registered agent addresses.
     */
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }

    /**
     * @notice Return active agent count.
     */
    function activeAgentCount() external view returns (uint256 count) {
        for (uint256 i = 0; i < agentList.length; i++) {
            if (agents[agentList[i]].active) count++;
        }
    }

    function setAuthorizedBackend(address backend, bool authorized) external onlyOwner {
        authorizedBackends[backend] = authorized;
    }
}
