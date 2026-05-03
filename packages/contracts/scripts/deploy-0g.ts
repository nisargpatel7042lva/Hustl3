import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy HustlMarketplace
  const HustlMarketplace = await ethers.getContractFactory("HustlMarketplace");
  const marketplace = await HustlMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  console.log("HustlMarketplace deployed to:", await marketplace.getAddress());

  // Deploy HustlAgentRegistry
  const HustlAgentRegistry = await ethers.getContractFactory("HustlAgentRegistry");
  const registry = await HustlAgentRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  console.log("HustlAgentRegistry deployed to:", await registry.getAddress());

  // Deploy HustlReputation
  const HustlReputation = await ethers.getContractFactory("HustlReputation");
  const reputation = await HustlReputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  console.log("HustlReputation deployed to:", await reputation.getAddress());

  // Deploy HustlEscrow
  const HustlEscrow = await ethers.getContractFactory("HustlEscrow");
  // Arbitrator defaults to deployer for hackathon demo
  const escrow = await HustlEscrow.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();
  console.log("HustlEscrow deployed to:", await escrow.getAddress());

  // Authorize backend for escrow
  console.log("Authorizing backend on Escrow...");
  const tx = await escrow.setAuthorizedBackend(deployer.address, true);
  await tx.wait();
  console.log("Authorized.");

  console.log("\nDone! Copy these addresses to apps/web/.env.local");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
