import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Shared Redis Connection
export const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

// Core Queues
export const executionQueue = new Queue('agent-execution', { connection });
export const ensQueue = new Queue('ens-sync', { connection });
export const paymentQueue = new Queue('payment-verification', { connection });

export async function enqueueAgentExecution(orderId: string, requirement: string, tier: number, blueprintHash?: string) {
  await executionQueue.add('execute', { orderId, requirement, tier, blueprintHash }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
}

export async function enqueueEnsSync(walletAddress: string, ensName: string) {
  await ensQueue.add('sync', { walletAddress, ensName }, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 }
  });
}

export async function enqueuePaymentVerification(orderId: string, txHash: string) {
  await paymentQueue.add('verify', { orderId, txHash }, {
    attempts: 10,
    backoff: { type: 'fixed', delay: 15000 } // Poll every 15 seconds
  });
}
