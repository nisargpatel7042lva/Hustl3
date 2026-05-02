/**
 * Mock Encryption/Decryption Service
 * 
 * For development: Simple XOR-based mock encryption
 * For production: Replace with real encryption (AES-256-GCM)
 */

import type { EncryptionOptions } from './types';

/**
 * Simple XOR-based encryption for development
 * DO NOT USE IN PRODUCTION
 */
class SimpleEncryption {
  private key: string;

  constructor(key: string = 'hustl3-dev-key') {
    this.key = key;
  }

  encrypt(data: string): string {
    const encrypted = Buffer.from(data)
      .toString('base64')
      .split('')
      .map((char, idx) => {
        const keyChar = this.key[idx % this.key.length];
        return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
      })
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');

    return encrypted;
  }

  decrypt(encrypted: string): string {
    try {
      const decrypted = encrypted
        .match(/.{1,2}/g)
        ?.map(hex => String.fromCharCode(parseInt(hex, 16)))
        .join('')
        .split('')
        .map((char, idx) => {
          const keyChar = this.key[idx % this.key.length];
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
        })
        .join('');

      if (!decrypted) return '';
      return Buffer.from(decrypted, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }

  setKey(key: string): void {
    this.key = key;
  }
}

/**
 * Encryption service wrapper
 */
export class EncryptionService {
  private simple: SimpleEncryption;
  private options: EncryptionOptions;

  constructor(options: EncryptionOptions = { algorithm: 'simple', enabled: true }) {
    this.options = options;
    this.simple = new SimpleEncryption();
  }

  /**
   * Encrypt data
   */
  encrypt(data: unknown): string {
    if (!this.options.enabled) {
      return JSON.stringify(data);
    }

    const jsonString = typeof data === 'string' ? data : JSON.stringify(data);

    switch (this.options.algorithm) {
      case 'simple':
        return this.simple.encrypt(jsonString);
      case 'aes':
        // TODO: Implement real AES encryption in production
        return this.simple.encrypt(jsonString);
      case 'xor':
        return this.simple.encrypt(jsonString);
      default:
        return JSON.stringify(data);
    }
  }

  /**
   * Decrypt data
   */
  decrypt<T = unknown>(encrypted: string): T {
    if (!this.options.enabled) {
      try {
        return JSON.parse(encrypted) as T;
      } catch {
        return encrypted as T;
      }
    }

    try {
      const decrypted = this.simple.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to decrypt:', error);
      return encrypted as T;
    }
  }

  /**
   * Update encryption key
   */
  setKey(key: string): void {
    this.simple.setKey(key);
  }

  /**
   * Enable/disable encryption
   */
  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  /**
   * Get encryption status
   */
  isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Get current algorithm
   */
  getAlgorithm(): string {
    return this.options.algorithm;
  }
}

/**
 * Utility functions for encryption
 */
export function createEncryptionService(
  algorithm: 'simple' | 'aes' | 'xor' = 'simple',
  enabled: boolean = true
): EncryptionService {
  return new EncryptionService({ algorithm, enabled });
}

export function encrypt(data: unknown, key?: string): string {
  const encryption = new SimpleEncryption(key);
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  return encryption.encrypt(jsonString);
}

export function decrypt<T = unknown>(encrypted: string, key?: string): T {
  const encryption = new SimpleEncryption(key);
  try {
    const decrypted = encryption.decrypt(encrypted);
    return JSON.parse(decrypted) as T;
  } catch {
    return encrypted as T;
  }
}
