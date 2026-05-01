/**
 * Storage System Types
 */

/**
 * Storage entry with metadata
 */
export interface StorageEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: Date;
  encrypted: boolean;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Event log entry
 */
export interface LogEntry {
  id: string;
  type: string;
  agentId?: string;
  entityId?: string;
  entityType?: 'agent' | 'skill' | 'gig' | 'task' | 'payment' | 'other';
  action: string;
  data: Record<string, unknown>;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  error?: string;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  totalEntries: number;
  totalSize: number;
  logEntries: number;
  oldestEntry?: Date;
  newestEntry?: Date;
  encryption: {
    enabled: boolean;
    keysUsed: number;
  };
}

/**
 * Query options for retrieving entries
 */
export interface StorageQuery {
  keyPattern?: RegExp | string;
  tag?: string;
  after?: Date;
  before?: Date;
  limit?: number;
}

/**
 * Storage namespace for organizing data
 */
export type StorageNamespace = 'agent' | 'skill' | 'gig' | 'task' | 'user' | 'system';

/**
 * Encryption options
 */
export interface EncryptionOptions {
  algorithm: 'simple' | 'aes' | 'xor';
  enabled: boolean;
  keyRotation?: boolean;
}
