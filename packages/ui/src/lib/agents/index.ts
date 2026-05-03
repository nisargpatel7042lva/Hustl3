/**
 * Agent System - Public API
 */

// Core runtime system
// export * from './core'; // Causes duplicate export with types.ts

// Existing types and utilities
export * from './types';
export { AgentRuntime } from './AgentRuntime';
export { ZeroGStorage, ZeroGCompute } from './zeroG';
export { SelfEvolutionLoop } from './SelfEvolutionLoop';
export { axl } from './axl';
export { onAxlMessage } from './api';
export * from './api';