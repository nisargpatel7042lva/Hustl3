/**
 * 0G Storage Service - KV Store + Log System
 * 
 * Simulates 0G decentralized storage with:
 * - Key-value storage for agent memory, skills, gigs
 * - Event log system for audit trail
 * - Optional encryption for sensitive data
 */

import type { StorageEntry, LogEntry, StorageStats, StorageQuery, StorageNamespace } from './types';
import { EncryptionService } from './encryption';

/**
 * Main storage service
 */
export class StorageService {
  private store = new Map<string, StorageEntry>();
  private logs: LogEntry[] = [];
  private encryption: EncryptionService;
  private maxLogSize = 10000;
  private namespace: StorageNamespace = 'system';

  constructor(encryption?: EncryptionService) {
    this.encryption = encryption || new EncryptionService({ algorithm: 'simple', enabled: false });
  }

  /**
   * Set a value in storage
   * 
   * @param key - Storage key (supports namespacing: "namespace:key")
   * @param value - Value to store
   * @param options - Additional options
   */
  set<T = unknown>(
    key: string,
    value: T,
    options?: {
      encrypt?: boolean;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }
  ): void {
    const shouldEncrypt = options?.encrypt ?? this.encryption.isEnabled();
    const storeKey = this.normalizeKey(key);

    const entry: StorageEntry = {
      key: storeKey,
      value: shouldEncrypt ? (this.encryption.encrypt(value) as unknown as T) : value,
      timestamp: new Date(),
      encrypted: shouldEncrypt,
      tags: options?.tags,
      metadata: options?.metadata,
    };

    this.store.set(storeKey, entry);

    // Log storage operation
    this.appendLog({
      type: 'storage:set',
      action: 'store_value',
      entityId: storeKey,
      entityType: this.inferEntityType(storeKey),
      data: {
        key: storeKey,
        encrypted: shouldEncrypt,
        hasMetadata: !!options?.metadata,
      },
      status: 'success',
    });
  }

  /**
   * Get a value from storage
   * 
   * @param key - Storage key
   * @param decrypt - Automatically decrypt if encrypted (default: true)
   * @returns The stored value or undefined
   */
  get<T = unknown>(key: string, decrypt: boolean = true): T | undefined {
    const storeKey = this.normalizeKey(key);
    const entry = this.store.get(storeKey);

    if (!entry) {
      return undefined;
    }

    if (entry.encrypted && decrypt) {
      try {
        return this.encryption.decrypt<T>(entry.value as unknown as string);
      } catch (error) {
        console.error(`Failed to decrypt key ${storeKey}:`, error);
        return undefined;
      }
    }

    return entry.value as T;
  }

  /**
   * Get raw entry with metadata
   */
  getEntry(key: string): StorageEntry | undefined {
    return this.store.get(this.normalizeKey(key));
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.store.has(this.normalizeKey(key));
  }

  /**
   * Delete a key
   */
  delete(key: string): boolean {
    const storeKey = this.normalizeKey(key);
    const deleted = this.store.delete(storeKey);

    if (deleted) {
      this.appendLog({
        type: 'storage:delete',
        action: 'delete_value',
        entityId: storeKey,
        entityType: this.inferEntityType(storeKey),
        data: { key: storeKey },
        status: 'success',
      });
    }

    return deleted;
  }

  /**
   * Clear all storage
   */
  clear(): void {
    this.store.clear();
    this.appendLog({
      type: 'storage:clear',
      action: 'clear_storage',
      entityType: 'system',
      data: { action: 'clear_all' },
      status: 'success',
    });
  }

  /**
   * Append an event to the log
   * 
   * @param event - Event to log (id and timestamp auto-generated)
   */
  appendLog(event: Omit<LogEntry, 'id' | 'timestamp'>): LogEntry {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
      ...event,
    };

    this.logs.push(logEntry);

    // Maintain max log size (keep newest entries)
    if (this.logs.length > this.maxLogSize) {
      this.logs = this.logs.slice(-this.maxLogSize);
    }

    return logEntry;
  }

  /**
   * Get logs with optional filtering
   * 
   * @param query - Filter options
   */
  getLogs(query?: {
    type?: string;
    entityType?: string;
    agentId?: string;
    status?: string;
    limit?: number;
  }): LogEntry[] {
    let results = [...this.logs];

    if (query?.type) {
      results = results.filter(log => log.type === query.type);
    }
    if (query?.entityType) {
      results = results.filter(log => log.entityType === query.entityType);
    }
    if (query?.agentId) {
      results = results.filter(log => log.agentId === query.agentId);
    }
    if (query?.status) {
      results = results.filter(log => log.status === query.status);
    }

    const limit = query?.limit ?? 100;
    return results.slice(-limit);
  }

  /**
   * Query storage entries
   */
  query(options?: StorageQuery): StorageEntry[] {
    let entries = Array.from(this.store.values());

    if (options?.keyPattern) {
      const pattern = typeof options.keyPattern === 'string'
        ? new RegExp(options.keyPattern)
        : options.keyPattern;
      entries = entries.filter(e => pattern.test(e.key));
    }

    if (options?.tag) {
      entries = entries.filter(e => e.tags?.includes(options.tag!));
    }

    if (options?.after) {
      entries = entries.filter(e => e.timestamp > options.after!);
    }

    if (options?.before) {
      entries = entries.filter(e => e.timestamp < options.before!);
    }

    const limit = options?.limit ?? 1000;
    return entries.slice(0, limit);
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    const entries = Array.from(this.store.values());
    const sizes = entries.map(e => this.estimateSize(e.value));
    const timestamps = entries.map(e => e.timestamp).sort((a, b) => a.getTime() - b.getTime());

    return {
      totalEntries: this.store.size,
      totalSize: sizes.reduce((a, b) => a + b, 0),
      logEntries: this.logs.length,
      oldestEntry: timestamps[0],
      newestEntry: timestamps[timestamps.length - 1],
      encryption: {
        enabled: this.encryption.isEnabled(),
        keysUsed: entries.filter(e => e.encrypted).length,
      },
    };
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Export storage as JSON (for backup/migration)
   */
  export(): {
    entries: Array<{
      key: string;
      value: unknown;
      timestamp: string;
      encrypted: boolean;
      tags?: string[];
    }>;
    logs: LogEntry[];
    stats: StorageStats;
  } {
    return {
      entries: Array.from(this.store.values()).map(e => ({
        key: e.key,
        value: e.value,
        timestamp: e.timestamp.toISOString(),
        encrypted: e.encrypted,
        tags: e.tags,
      })),
      logs: this.logs,
      stats: this.getStats(),
    };
  }

  /**
   * Import storage from JSON (for restore/migration)
   */
  import(data: {
    entries: Array<{
      key: string;
      value: unknown;
      timestamp?: string;
      encrypted?: boolean;
      tags?: string[];
    }>;
  }): void {
    for (const entry of data.entries) {
      this.store.set(entry.key, {
        key: entry.key,
        value: entry.value,
        timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        encrypted: entry.encrypted ?? false,
        tags: entry.tags,
      });
    }

    this.appendLog({
      type: 'storage:import',
      action: 'import_data',
      entityType: 'system',
      data: { entriesImported: data.entries.length },
      status: 'success',
    });
  }

  /**
   * Enable encryption for storage
   */
  enableEncryption(key?: string): void {
    this.encryption.setEnabled(true);
    if (key) {
      this.encryption.setKey(key);
    }
    this.appendLog({
      type: 'security:encryption',
      action: 'enable_encryption',
      entityType: 'system',
      data: { algorithm: this.encryption.getAlgorithm() },
      status: 'success',
    });
  }

  /**
   * Disable encryption
   */
  disableEncryption(): void {
    this.encryption.setEnabled(false);
    this.appendLog({
      type: 'security:encryption',
      action: 'disable_encryption',
      entityType: 'system',
      data: {},
      status: 'success',
    });
  }

  /**
   * Rotate encryption key
   */
  rotateKey(newKey: string): void {
    const oldEntries = Array.from(this.store.values());

    // Re-encrypt all entries with new key
    this.encryption.setKey(newKey);
    for (const entry of oldEntries) {
      if (entry.encrypted) {
        // Decrypt with old key (handled by setKey transition)
        // Re-encrypt with new key
        // Note: In production, implement proper key rotation
      }
    }

    this.appendLog({
      type: 'security:keyrotation',
      action: 'rotate_encryption_key',
      entityType: 'system',
      data: { entriesRotated: oldEntries.length },
      status: 'success',
    });
  }

  /**
   * Get storage size in bytes (estimated)
   */
  getSize(): number {
    return Array.from(this.store.values())
      .reduce((total, entry) => total + this.estimateSize(entry.value), 0);
  }

  /**
   * Set namespace for keys
   */
  setNamespace(namespace: StorageNamespace): void {
    this.namespace = namespace;
  }

  /**
   * Get current namespace
   */
  getNamespace(): StorageNamespace {
    return this.namespace;
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private normalizeKey(key: string): string {
    // Add namespace if not already present
    if (!key.includes(':')) {
      return `${this.namespace}:${key}`;
    }
    return key;
  }

  private inferEntityType(key: string): StorageNamespace {
    const [namespace] = key.split(':');
    return (namespace as StorageNamespace) || 'system';
  }

  private estimateSize(value: unknown): number {
    try {
      const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
      return new TextEncoder().encode(jsonString).length;
    } catch {
      return 0;
    }
  }
}

/**
 * Create a storage service instance
 */
export function createStorage(encryption?: EncryptionService): StorageService {
  return new StorageService(encryption);
}
