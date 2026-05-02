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

  console.log("\n--- Deployment Summary ---");
  console.log("Marketplace:", marketplaceAddress);
  console.log("Escrow:", escrowAddress);
  console.log("Reputation:", reputationAddress);
  console.log("Agent Registry:", registryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
