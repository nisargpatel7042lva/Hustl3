import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy HustlMarketplace
  const HustlMarketplace = await ethers.getContractFactory("HustlMarketplace");
  const marketplace = await HustlMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("HustlMarketplace deployed to:", marketplaceAddress);

  // Deploy HustlEscrow
  // Arbitrator is deployer for now
  const HustlEscrow = await ethers.getContractFactory("HustlEscrow");
  const escrow = await HustlEscrow.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("HustlEscrow deployed to:", escrowAddress);

  // Deploy HustlReputation
  const HustlReputation = await ethers.getContractFactory("HustlReputation");
  const reputation = await HustlReputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("HustlReputation deployed to:", reputationAddress);

  // Deploy HustlAgentRegistry
  const HustlAgentRegistry = await ethers.getContractFactory("HustlAgentRegistry");
  const registry = await HustlAgentRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("HustlAgentRegistry deployed to:", registryAddress);

  // ─── 0G Chain Specific Contracts ─────────────────────────────────────────

  // 5. OGWrappedToken (WOGAI)
  const OGWrappedToken = await ethers.getContractFactory("OGWrappedToken");
  const wogai = await OGWrappedToken.deploy(deployer.address);
  await wogai.waitForDeployment();
  const wogaiAddress = await wogai.getAddress();
  console.log("OGWrappedToken (WOGAI) deployed to:", wogaiAddress);

  // 6. OGChainDA
  const OGChainDA = await ethers.getContractFactory("OGChainDA");
  const ogChainDA = await OGChainDA.deploy(deployer.address);
  await ogChainDA.waitForDeployment();
  const ogChainDAAddress = await ogChainDA.getAddress();
  console.log("OGChainDA deployed to:", ogChainDAAddress);

  // 7. AgenticID
  const AgenticID = await ethers.getContractFactory("AgenticID");
  const agenticID = await AgenticID.deploy(deployer.address);
  await agenticID.waitForDeployment();
  const agenticIDAddress = await agenticID.getAddress();
  console.log("AgenticID deployed to:", agenticIDAddress);

  console.log("\n--- Deployment Summary ---");
  console.log("Marketplace:", marketplaceAddress);
  console.log("Escrow:", escrowAddress);
  console.log("Reputation:", reputationAddress);
  console.log("Agent Registry:", registryAddress);
  console.log("WOGAI:", wogaiAddress);
  console.log("OGChainDA:", ogChainDAAddress);
  console.log("AgenticID:", agenticIDAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
