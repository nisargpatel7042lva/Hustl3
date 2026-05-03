import { ethers } from "hardhat";

/**
 * Authorize the KeeperHub managed wallet as a backend on all Hustl3 contracts.
 *
 * KeeperHub uses its own managed wallet to sign transactions — we need to
 * grant it permission to call onlyAuthorizedBackend / onlyOperator functions.
 *
 * Run with:
 *   PRIVATE_KEY=0x... KEEPERHUB_WALLET=0x... npx hardhat run scripts/authorize-keeperhub.ts --network sepolia
 */

const ESCROW_ADDRESS     = "0xc0760CD950D4e42cEF21E0e3016E7B676c718238";
const REPUTATION_ADDRESS = "0x4bf6716f675adCBe85E868944B8C7e14aB89d190";
const REGISTRY_ADDRESS   = "0x7F57A325a62095530441847F6E3bdAF356cc4319";

const ESCROW_ABI = [
  "function setAuthorizedBackend(address backend, bool authorized) external",
  "function authorizedBackends(address) external view returns (bool)"
];

const REPUTATION_ABI = [
  "function setAuthorizedOperator(address operator, bool authorized) external",
  "function authorizedOperators(address) external view returns (bool)"
];

const REGISTRY_ABI = [
  "function setAuthorizedBackend(address backend, bool authorized) external",
  "function authorizedBackends(address) external view returns (bool)"
];

async function main() {
  const keeperHubWallet = process.env.KEEPERHUB_WALLET;
  if (!keeperHubWallet) {
    throw new Error("Set KEEPERHUB_WALLET env var to your KeeperHub managed wallet address");
  }

  const [deployer] = await ethers.getSigners();
  console.log("Authorizing from:", deployer.address);
  console.log("KeeperHub wallet:", keeperHubWallet);
  console.log("");

  // 1. Authorize on HustlEscrow
  console.log("Authorizing on HustlEscrow...");
  const escrow = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, deployer);
  const alreadyEscrow = await escrow.authorizedBackends(keeperHubWallet);
  if (alreadyEscrow) {
    console.log("  Already authorized on Escrow ✓");
  } else {
    const tx = await escrow.setAuthorizedBackend(keeperHubWallet, true);
    await tx.wait();
    console.log("  Authorized on Escrow ✓ tx:", tx.hash);
  }

  // 2. Authorize on HustlReputation
  console.log("Authorizing on HustlReputation...");
  const reputation = new ethers.Contract(REPUTATION_ADDRESS, REPUTATION_ABI, deployer);
  const alreadyRep = await reputation.authorizedOperators(keeperHubWallet);
  if (alreadyRep) {
    console.log("  Already authorized on Reputation ✓");
  } else {
    const tx = await reputation.setAuthorizedOperator(keeperHubWallet, true);
    await tx.wait();
    console.log("  Authorized on Reputation ✓ tx:", tx.hash);
  }

  // 3. Authorize on HustlAgentRegistry
  console.log("Authorizing on HustlAgentRegistry...");
  const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, deployer);
  const alreadyReg = await registry.authorizedBackends(keeperHubWallet);
  if (alreadyReg) {
    console.log("  Already authorized on Registry ✓");
  } else {
    const tx = await registry.setAuthorizedBackend(keeperHubWallet, true);
    await tx.wait();
    console.log("  Authorized on Registry ✓ tx:", tx.hash);
  }

  console.log("\n========================================");
  console.log("AUTHORIZATION COMPLETE");
  console.log(`KeeperHub wallet ${keeperHubWallet} can now:`);
  console.log("  - Call markDelivered() on Escrow");
  console.log("  - Call releaseEscrow() on Escrow");
  console.log("  - Call raiseDispute() on Escrow");
  console.log("  - Call recordReputation() on Reputation");
  console.log("  - Call updateCapabilityHash() on Registry");
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
