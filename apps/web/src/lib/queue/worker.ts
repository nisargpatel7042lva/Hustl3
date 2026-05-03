import { Worker, Job } from 'bullmq';
import { connection } from './client';
import { executeHarness } from '../agents/harness';
import { runMoAEngine } from '../agents/moa';
import { ethers } from 'ethers';

console.log('Starting Hustl3 BullMQ Workers...');

// 1. Agent Execution Worker
const executionWorker = new Worker('agent-execution', async (job: Job) => {
  const { orderId, requirement, tier, blueprintHash } = job.data;
  console.log(`[Worker] Executing job ${job.id} for order ${orderId} (Tier ${tier})`);
  
  if (tier === 3) {
    await executeHarness(orderId, requirement, blueprintHash);
  } else if (tier === 2) {
    await runMoAEngine(orderId, requirement, {
      parallelWorkers: 3,
      baseModel: 'qwen3.6-plus',
      aggregatorModel: 'qwen3.6-plus',
      aggregationStrategy: 'Synthesize'
    });
  } else {
    // Basic single agent simulation
    console.log(`[Worker] Executing solo tier task for ${orderId}`);
  }
  
  console.log(`[Worker] Completed job ${job.id} for order ${orderId}`);
}, { connection });

// 2. ENS Sync Worker
const ensWorker = new Worker('ens-sync', async (job: Job) => {
  const { walletAddress, ensName } = job.data;
  console.log(`[Worker] Syncing ENS records for ${ensName} (${walletAddress})`);
  
  // Connect to base sepolia via ethers
  const rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const privateKey = process.env.OPERATOR_PRIVATE_KEY;
  if (!privateKey) {
    console.warn('[Worker] OPERATOR_PRIVATE_KEY not set. Skipping real ENS sync.');
    return;
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(`[Worker] ENS Sync complete for ${ensName} (Mocked TX Hash: 0x...)`);
  
  // In production, we'd interact with ENS NameWrapper and PublicResolver here
  // const nameWrapper = new ethers.Contract(NAME_WRAPPER_ADDRESS, NameWrapperABI, wallet);
  // await nameWrapper.setSubnodeOwner(...);
  
}, { connection });

// 3. Payment Verification Worker
const paymentWorker = new Worker('payment-verification', async (job: Job) => {
  const { orderId, txHash } = job.data;
  console.log(`[Worker] Verifying payment ${txHash} for order ${orderId}`);
  
  const rpcUrl = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai';
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  const receipt = await provider.getTransactionReceipt(txHash);
  if (!receipt) {
    throw new Error('Transaction not yet mined'); // Triggers BullMQ retry
  }
  
  if (receipt.status === 0) {
    console.error(`[Worker] Payment transaction ${txHash} failed on-chain`);
    // Handle failure logic...
  } else {
    console.log(`[Worker] Payment verified successfully for order ${orderId}`);
    // Update order status if needed...
  }
}, { connection });

executionWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});
