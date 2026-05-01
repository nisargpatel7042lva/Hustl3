/**
 * Storage Service - Public API
 */

export { StorageService, createStorage } from './storage';
export { EncryptionService, createEncryptionService, encrypt, decrypt } from './encryption';
export * from './types';

/**
 * Storage service singleton for application-wide use
 */
import { StorageService } from './storage';
import { EncryptionService } from './encryption';

let globalStorageInstance: StorageService | null = null;

/**
 * Get global storage instance (lazy initialization)
 */
export function getStorage(): StorageService {
  if (!globalStorageInstance) {
    const encryption = new EncryptionService({ algorithm: 'simple', enabled: false });
    globalStorageInstance = new StorageService(encryption);
  }
  return globalStorageInstance;
}

/**
 * Initialize storage with custom configuration
 */
export function initializeStorage(encryption?: EncryptionService): StorageService {
  const enc = encryption || new EncryptionService({ algorithm: 'simple', enabled: false });
  globalStorageInstance = new StorageService(enc);
  return globalStorageInstance;
}

/**
 * Reset storage (for testing)
 */
export function resetStorage(): void {
  globalStorageInstance = null;
}
