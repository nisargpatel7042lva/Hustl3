import { ethers } from 'ethers';

// Fallback ABIs to ensure the app works even if contract ABIs aren't fully imported
export const MarketplaceABI = [
  "function listGig(string gigId, bytes32 ensNameHash, bytes32 metadataHash, uint256 price, address paymentToken) external",
  "function verifyGig(string gigId, bytes32 expectedHash) external view returns (bool)",
  "function updateMetadataHash(string gigId, bytes32 newMetadataHash) external"
];

export const EscrowABI = [
  "function createEscrowETH(string orderId, address seller, string keeperHubJobId) external payable",
  "function createEscrowToken(string orderId, address seller, address token, uint256 amount, string keeperHubJobId) external",
  "function markDelivered(string orderId) external",
  "function releaseEscrow(string orderId) external",
  "function refundEscrow(string orderId) external",
  "function raiseDispute(string orderId) external"
];

export const ReputationABI = [
  "function recordReputation(address subject, address rater, string orderId, uint8 rating, bytes32 metadataHash) external",
  "function getReputationScore(address subject) external view returns (uint256, uint256)",
  "function endorseAgent(address subject, string skillName, string comment) external"
];

export const RegistryABI = [
  "function registerAgent(address agentWallet, address ownerWallet, bytes32 ensNameHash, bytes32 capabilityHash, uint8 agentType) external",
  "function isRegisteredAgent(address agentWallet) external view returns (bool)",
  "function updateCapabilityHash(address agentWallet, bytes32 newHash) external"
];

export const WOGAITokenABI = [
  "function deposit() external payable",
  "function depositWithDAProof(bytes anchorData) external payable returns (bytes32 commitment)",
  "function withdraw(uint256 amount) external"
];

export const OGChainDAABI = [
  "function submitDABlob(bytes data, string tag) external returns (bytes32 commitment)"
];

export const AgenticIDABI = [
  "function mint(string encryptedMetaCID, bytes ownerPubKey, uint8 agentType, uint64 capabilityFlags) external returns (uint256 tokenId)",
  "function registerPublicKey(bytes pubKey) external"
];

export function getContractInstance(address: string, abi: any[], providerOrSigner: ethers.Provider | ethers.Signer) {
  return new ethers.Contract(address, abi, providerOrSigner);
}

// Map chainId to RPC and Contract addresses
export const CONTRACT_ADDRESSES: Record<number, Record<string, string>> = {
  // 0G Chain (Galileo Testnet - 16601 / older 16600)
  16600: {
    Marketplace: process.env.NEXT_PUBLIC_0G_MARKETPLACE || "",
    Escrow: process.env.NEXT_PUBLIC_0G_ESCROW || "",
    Reputation: process.env.NEXT_PUBLIC_0G_REPUTATION || "",
    Registry: process.env.NEXT_PUBLIC_0G_REGISTRY || "",
    WOGAI: process.env.NEXT_PUBLIC_0G_WOGAI || "",
    OGChainDA: process.env.NEXT_PUBLIC_0G_CHAIN_DA || "",
    AgenticID: process.env.NEXT_PUBLIC_0G_AGENTIC_ID || ""
  },
  16602: {
    Marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "",
    Escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "",
    Reputation: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || "",
    Registry: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "",
    WOGAI: process.env.NEXT_PUBLIC_0G_WOGAI || "",
    OGChainDA: process.env.NEXT_PUBLIC_0G_CHAIN_DA || "",
    AgenticID: process.env.NEXT_PUBLIC_0G_AGENTIC_ID || ""
  },
  // Base Sepolia
  84532: {
    Marketplace: process.env.NEXT_PUBLIC_BASE_MARKETPLACE || "",
    Escrow: process.env.NEXT_PUBLIC_BASE_ESCROW || "",
    Reputation: process.env.NEXT_PUBLIC_BASE_REPUTATION || "",
    Registry: process.env.NEXT_PUBLIC_BASE_REGISTRY || ""
  }
};
