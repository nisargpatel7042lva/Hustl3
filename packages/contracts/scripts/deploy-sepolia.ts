import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to Sepolia with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer has no ETH. Get Sepolia ETH from https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  }

  // 1. HustlEscrow
  console.log("\nDeploying HustlEscrow...");
  const HustlEscrow = await ethers.getContractFactory("HustlEscrow");
  const escrow = await HustlEscrow.deploy(deployer.address, deployer.address);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log("HustlEscrow:", escrowAddress);

  // 2. HustlReputation
  console.log("\nDeploying HustlReputation...");
  const HustlReputation = await ethers.getContractFactory("HustlReputation");
  const reputation = await HustlReputation.deploy(deployer.address);
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log("HustlReputation:", reputationAddress);

  // 3. HustlAgentRegistry
  console.log("\nDeploying HustlAgentRegistry...");
  const HustlAgentRegistry = await ethers.getContractFactory("HustlAgentRegistry");
  const registry = await HustlAgentRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("HustlAgentRegistry:", registryAddress);

  // 4. HustlMarketplace
  console.log("\nDeploying HustlMarketplace...");
  const HustlMarketplace = await ethers.getContractFactory("HustlMarketplace");
  const marketplace = await HustlMarketplace.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("HustlMarketplace:", marketplaceAddress);

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE — add to .env.local:");
  console.log("========================================");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
  console.log(`NEXT_PUBLIC_REPUTATION_ADDRESS=${reputationAddress}`);
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}`);
  console.log(`NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log(`NEXT_PUBLIC_CHAIN_ID=11155111`);
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
