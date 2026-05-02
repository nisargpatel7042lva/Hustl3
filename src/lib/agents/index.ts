/**
 * Agent System - Public API
 */

// Core runtime system
export { Agent, AgentManager, EventBus } from './core';
export type { AgentConfig } from './core';

// Existing types and utilities
export type {
  Skill,
  Task,
  ExecutionContext,
  EvolutionEvent,
  StorageData,
  ComputeJob,
} from './types';
export { AgentRuntime } from './AgentRuntime';
export { ZeroGStorage, ZeroGCompute } from './zeroG';
export { SelfEvolutionLoop } from './SelfEvolutionLoop';
export { axl } from './axl';
export { onAxlMessage } from './api';
export * from './api';

// New: 0G Compute wrapper
export { compute } from './compute';
export type { ComputeResult } from './compute';

// New: 6 Agent Roles
export { Planner, Researcher, Executor, Critic, Seller, Auditor } from './roles';
export type { AgentTier } from './SelfEvolutionLoop';

// New: Demos & Examples
export * from './demo';