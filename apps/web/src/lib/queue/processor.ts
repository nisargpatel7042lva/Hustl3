import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { executeAgentTask } from '@/lib/agents/executor';
import { triggerSkillGeneration } from '@/lib/agents/evolution';
import { kvGet, KEYS } from '@/lib/storage/zerog';
import winston from 'winston';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

// Define Queues
export const agentExecutionQueue = new Queue('agent-execution', { connection });
export const skillGenerationQueue = new Queue('skill-generation', { connection });
export const ensSyncQueue = new Queue('ens-sync', { connection });
export const paymentConfirmQueue = new Queue('payment-confirmation', { connection });

// Initialize Workers if not running in an edge environment
export function initWorkers() {
  if (process.env.NEXT_RUNTIME === 'edge') return;

  const agentWorker = new Worker('agent-execution', async (job: Job) => {
    logger.info(`Starting agent execution for order ${job.data.orderId}`);
    try {
      const result = await executeAgentTask(job.data.agentWallet, job.data);
      logger.info(`Agent execution completed for order ${job.data.orderId}`, { result });
      return result;
    } catch (err) {
      logger.error(`Agent execution failed for order ${job.data.orderId}`, { error: String(err) });
      throw err;
    }
  }, { 
    connection, 
    concurrency: 5,
    limiter: { max: 10, duration: 1000 } 
  });

  const skillWorker = new Worker('skill-generation', async (job: Job) => {
    logger.info(`Starting skill generation for agent ${job.data.agentWallet}`);
    try {
      const result = await triggerSkillGeneration(job.data.agentWallet);
      return result;
    } catch (err) {
      logger.error(`Skill generation failed for agent ${job.data.agentWallet}`, { error: String(err) });
      throw err;
    }
  }, { 
    connection, 
    concurrency: 2 
  });

  agentWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in agent-execution queue`, { error: err.message });
  });

  skillWorker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in skill-generation queue`, { error: err.message });
  });
}
