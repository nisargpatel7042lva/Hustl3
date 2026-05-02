/**
 * Core types for the agent runtime system
 */

/**
 * Agent state during execution
 */
export type AgentState = 'idle' | 'working' | 'waiting' | 'error';

/**
 * Agent role determining behavior and responsibilities
 */
export type AgentRole =
  | 'planner' // Plans and decomposes goals
  | 'researcher' // Researches and gathers information
  | 'executor' // Executes tasks and actions
  | 'critic' // Evaluates and validates work
  | 'seller' // Sells services on marketplace
  | 'auditor'; // Audits and monitors agents

/**
 * Represents a skill an agent can perform
 */
export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * A goal or task an agent needs to complete
 */
export interface Goal {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: Date;
  requiredSkills?: string[];
  budget?: number;
  metadata?: Record<string, unknown>;
}

/**
 * A sub-task created by decomposing a goal
 */
export interface Task {
  id: string;
  goalId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  result?: unknown;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Message between agents via AXL transport
 */
export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'event' | 'broadcast';
  subject: string;
  payload: unknown;
  conversationId?: string;
  replyTo?: string;
  timestamp: Date;
}

/**
 * Core wallet/payment info for an agent
 */
export interface AgentWallet {
  address: string;
  balance: number;
  pendingBalance: number;
}

/**
 * Agent memory - local context and state
 */
export interface AgentMemory {
  conversationHistory: AgentMessage[];
  goalHistory: Goal[];
  taskHistory: Task[];
  recentErrors: Array<{ message: string; timestamp: Date }>;
  metadata: Record<string, unknown>;
}

/**
 * Evaluation result from critic
 */
export interface EvaluationResult {
  taskId: string;
  agentId: string;
  isValid: boolean;
  score: number; // 0-100
  feedback: string;
  suggestedImprovements: string[];
  timestamp: Date;
}

/**
 * Evolution trigger for skill learning
 */
export interface EvolutionTrigger {
  type: 'success_threshold' | 'error_pattern' | 'manual' | 'auto_suggest';
  description: string;
  suggestedSkill?: AgentSkill;
  priority: 'low' | 'medium' | 'high';
}

/**
 * Represents execution context for a task
 */
export interface ExecutionContext {
  id: string;
  agentId: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: unknown;
  output?: unknown;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
}

/**
 * Plan decomposing a goal into tasks
 */
export interface ExecutionPlan {
  id: string;
  goalId: string;
  createdBy: string;
  tasks: Task[];
  strategy: string;
  estimatedDuration?: number;
  risks?: string[];
}
