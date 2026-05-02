import { kvGet, kvSet, logAppend, KEYS, STREAMS } from '@/lib/storage/zerog';

export interface MemoryContext {
  activeTaskId: string | null;
  recentContext: Array<{ role: 'user' | 'agent' | 'system'; content: string }>;
  skills: Record<string, unknown>; // JSON representation of skills
  preferences: Record<string, unknown>; // user preferences by address
  metrics: {
    tasksCompleted: number;
    successRate: number;
    totalEarned: string;
  };
  personality: string;
}

export enum LogEntryType {
  TASK_COMPLETED = 'TASK_COMPLETED',
  SKILL_GENERATED = 'SKILL_GENERATED',
  PAYMENT_SENT = 'PAYMENT_SENT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  AXL_MESSAGE_SENT = 'AXL_MESSAGE_SENT',
  AXL_MESSAGE_RECEIVED = 'AXL_MESSAGE_RECEIVED',
  AGENT_HIRED = 'AGENT_HIRED',
  DISPUTE_RAISED = 'DISPUTE_RAISED',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED'
}

export interface LogEntry {
  type: LogEntryType;
  payload: Record<string, unknown>;
  references: string[]; // 0G Storage URIs/Keys
}

/**
 * Load agent's current KV working state
 */
export async function loadAgentKVMemory(walletAddress: string): Promise<MemoryContext> {
  const key = KEYS.agentMemory(walletAddress);
  const mem = await kvGet<MemoryContext>(key);
  if (mem) return mem;
  
  // Default empty memory
  return {
    activeTaskId: null,
    recentContext: [],
    skills: {},
    preferences: {},
    metrics: { tasksCompleted: 0, successRate: 100, totalEarned: '0' },
    personality: 'Professional, efficient, and precise AI service agent.'
  };
}

/**
 * Update agent's KV working state
 */
export async function saveAgentKVMemory(walletAddress: string, memory: MemoryContext): Promise<void> {
  const key = KEYS.agentMemory(walletAddress);
  await kvSet(key, memory);
}

/**
 * Append to agent's episodic Log memory
 */
export async function appendAgentLog(walletAddress: string, entry: LogEntry): Promise<void> {
  const streamId = STREAMS.agentActivity(walletAddress);
  await logAppend(streamId, entry);
}
