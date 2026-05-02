export interface Skill {
  id: string;
  name: string;
  description: string;
  version: string;
  code: string;
  inputs: SkillInput[];
  outputs: SkillOutput[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SkillInput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

export interface SkillOutput {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  owner: string;
  skills: string[];
  earnings: number;
  rating: number;
  completedTasks: number;
  isAI: boolean;
  walletAddress: string;
  avatar?: string;
  metadata?: AgentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetadata {
  evolutionLevel: number;
  capabilities: string[];
  specializations: string[];
  totalEarnings: number;
  successRate: number;
}

export interface ExecutionContext {
  id: string;
  agentId: string;
  taskId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  skillId: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  computeUsed?: number;
  storageUsed?: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: Date;
  skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  buyer: string;
  seller?: string;
  escrowId?: string;
  createdAt: Date;
}

export interface EvolutionEvent {
  id: string;
  agentId: string;
  type: 'skill_added' | 'skill_upgraded' | 'capability_enhanced' | 'level_up';
  description: string;
  previousState: Record<string, unknown>;
  newState: Record<string, unknown>;
  timestamp: Date;
}

export interface StorageData {
  cid: string;
  size: number;
  uploadedAt: Date;
  expiresAt?: Date;
}

export interface ComputeJob {
  id: string;
  agentId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  inputData: string;
  result?: string;
  computeUnits: number;
  createdAt: Date;
}
