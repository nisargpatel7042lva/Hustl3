# 0G Storage Service - Abstraction Layer

A clean, modular storage service for Hustl3 that simulates 0G decentralized storage with key-value storage, event logging, and encryption.

## Overview

The Storage Service provides:

- **KV Storage**: Store and retrieve any data with automatic serialization
- **Event Logging**: Append-only audit trail for all operations
- **Encryption**: Optional encryption/decryption for sensitive data
- **Namespacing**: Organize data by type (agent, skill, gig, task, user, system)
- **Querying**: Search storage by key pattern, tags, timestamp range
- **Backup/Restore**: Export and import data for migration/recovery

## Core API

### Basic Operations

```typescript
import { getStorage } from '@/lib/storage'

const storage = getStorage()

// Set a value
storage.set('key', { data: 'value' })
storage.set('key', data, { encrypt: true, tags: ['important'] })

// Get a value
const value = storage.get('key')
const decrypted = storage.get('key', true) // Auto-decrypt if encrypted

// Check existence
if (storage.has('key')) { /* ... */ }

// Delete
storage.delete('key')
```

### Event Logging

```typescript
// Log events automatically (on storage operations)
storage.appendLog({
  type: 'custom:event',
  action: 'something_happened',
  entityType: 'agent',
  entityId: 'agent-1',
  data: { detail: 'info' },
  status: 'success',
})

// Query logs
const logs = storage.getLogs({ type: 'custom:event', limit: 50 })
const errorLogs = storage.getLogs({ status: 'error' })
```

### Encryption

```typescript
// Enable encryption
storage.enableEncryption()
storage.set('secret', sensitiveData, { encrypt: true })

// Disable encryption
storage.disableEncryption()

// Rotate key
storage.rotateKey('new-encryption-key')

// Check encryption status
if (storage.getStats().encryption.enabled) { /* ... */ }
```

## Namespaces

Organize data by namespace:

```typescript
// Agent namespace
storage.setNamespace('agent')
storage.set('luna:memory', agentMemory)
storage.set('max:state', agentState)

// Skill namespace
storage.setNamespace('skill')
storage.set('solidity', skillData)

// Gig namespace
storage.setNamespace('gig')
storage.set('audit-service', gigData)

// Custom key with namespace
storage.set('agent:luna:memory', data) // Explicit namespace
```

## Query and Search

```typescript
// Query by key pattern
storage.query({ keyPattern: 'agent:*' })
storage.query({ keyPattern: /^agent:/ })

// Query by tag
storage.query({ tag: 'production-ready' })

// Query by time range
storage.query({ 
  after: new Date('2026-01-01'),
  before: new Date('2026-06-01')
})

// Combine filters
storage.query({ 
  keyPattern: 'gig:*',
  tag: 'premium',
  limit: 100
})
```

## Statistics and Management

```typescript
// Get storage stats
const stats = storage.getStats()
// { totalEntries, totalSize, logEntries, encryption, ... }

// Get all keys
const keys = storage.keys()

// Export for backup
const backup = storage.export()
// { entries, logs, stats }

// Import from backup
storage.import(backup)

// Clear all
storage.clear()
```

## Usage Examples

### Agent Memory Persistence

```typescript
const storage = getStorage()
storage.setNamespace('agent')

// Save agent memory
storage.set('luna:memory', {
  conversations: [...],
  executionHistory: [...],
  skills: [...],
  state: 'idle'
}, { 
  encrypt: true,
  tags: ['critical'],
  metadata: { version: '1.0', agentId: 'luna' }
})

// Retrieve agent memory
const memory = storage.get('luna:memory')
```

### Skill Storage

```typescript
storage.setNamespace('skill')

// Store skill
storage.set('solidity', {
  name: 'Smart Contract Development',
  version: '2.1.0',
  code: 'function deploy() {...}',
  usageCount: 156,
  successRate: 0.92
}, {
  tags: ['blockchain', 'ethereum'],
  metadata: { version: '2.1.0' }
})

// Find all production skills
const skills = storage.query({
  tag: 'production-ready'
})
```

### Gig Listings

```typescript
storage.setNamespace('gig')

// Store gig
storage.set('audit-service', {
  title: 'Smart Contract Audit',
  seller: 'agent-security-01',
  price: 5000,
  tier: 'premium',
  rating: 4.9
}, {
  tags: ['premium', 'security-audit'],
  metadata: { seller: 'agent-security-01' }
})

// Find premium gigs
const premiumGigs = storage.query({ tag: 'premium' })

// Find gigs by skill
const auditGigs = storage.query({ tag: 'security-audit' })
```

### Event Audit Trail

```typescript
// Log transaction
storage.appendLog({
  type: 'transaction:payment',
  action: 'payment_received',
  agentId: 'executor-max',
  entityId: 'tx-001',
  entityType: 'payment',
  data: { amount: 2000, from: 'user-alice' },
  status: 'success'
})

// View audit trail
const trail = storage.getLogs({ 
  agentId: 'executor-max',
  limit: 100 
})

// Find errors
const errors = storage.getLogs({ status: 'error' })
```

## Integration with Agent Runtime

```typescript
import { Agent } from '@/lib/agents/core'
import { getStorage } from '@/lib/storage'

// Create agent with storage
const agent = new Agent({
  id: 'luna-01',
  name: 'Luna',
  role: 'planner'
})

// Store agent memory
const storage = getStorage()
storage.setNamespace('agent')
storage.set(`${agent.id}:memory`, {
  conversations: agent.getMemory().conversationHistory,
  executions: agent.getExecutionHistory(),
  triggers: agent.getEvolutionTriggers()
}, {
  encrypt: true,
  tags: ['agent-state', 'critical']
})

// Log agent events
storage.appendLog({
  type: 'agent:execution',
  action: 'execute_goal',
  agentId: agent.id,
  entityType: 'agent',
  data: {
    goalId: 'goal-1',
    taskCount: 3,
    status: 'completed'
  },
  status: 'success'
})
```

## Encryption

### Enable Encryption

```typescript
import { getStorage } from '@/lib/storage'

const storage = getStorage()

// Enable encryption (default: 'simple' algorithm)
storage.enableEncryption()

// Store sensitive data
storage.set('secret:key', sensitiveData, { encrypt: true })

// Data is automatically decrypted on retrieval
const data = storage.get('secret:key') // Auto-decrypts
```

### Custom Encryption

```typescript
import { EncryptionService, StorageService } from '@/lib/storage'

// Create custom encryption
const encryption = new EncryptionService({
  algorithm: 'simple', // 'simple' | 'aes' | 'xor'
  enabled: true,
  keyRotation: false
})

encryption.setKey('my-custom-key')

// Use with storage
const storage = new StorageService(encryption)
```

### Direct Encryption Functions

```typescript
import { encrypt, decrypt } from '@/lib/storage'

// Encrypt data
const encrypted = encrypt(sensitiveData, 'my-key')

// Decrypt data
const decrypted = decrypt(encrypted, 'my-key')
```

## File Structure

```
src/lib/storage/
├── storage.ts           (Main storage service - 350 lines)
├── encryption.ts        (Encryption utilities - 150 lines)
├── types.ts             (Type definitions - 50 lines)
├── examples.ts          (6 practical examples - 400 lines)
└── index.ts             (Public API exports)
```

## Type System

### StorageEntry
```typescript
{
  key: string
  value: any
  timestamp: Date
  encrypted: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}
```

### LogEntry
```typescript
{
  id: string
  type: string
  action: string
  agentId?: string
  entityId?: string
  entityType: 'agent' | 'skill' | 'gig' | 'task' | 'payment' | 'other'
  data: Record<string, unknown>
  timestamp: Date
  status: 'success' | 'error' | 'pending'
  error?: string
}
```

### StorageStats
```typescript
{
  totalEntries: number
  totalSize: number
  logEntries: number
  oldestEntry?: Date
  newestEntry?: Date
  encryption: { enabled: boolean, keysUsed: number }
}
```

## Performance

- **Set/Get**: O(1) - Map-based storage
- **Query**: O(n) - Filter-based search (n = matching entries)
- **Logs**: O(1) append, O(n) search
- **Size Limit**: 1000 entries (configurable)
- **Log Limit**: 10,000 events (configurable)

## Error Handling

```typescript
const storage = getStorage()

// Handle get errors
const value = storage.get('key') // Returns undefined if not found
if (!value) { /* handle missing */ }

// Handle encryption errors
try {
  const data = storage.get('encrypted:key')
} catch (error) {
  console.error('Decryption failed:', error)
}

// Log failures
storage.appendLog({
  type: 'error:operation',
  action: 'operation_failed',
  data: { operation: 'read_key', reason: 'not_found' },
  status: 'error',
  error: 'Key not found'
})
```

## Testing

```typescript
import { createStorage, createEncryptionService } from '@/lib/storage'

// Create fresh storage for testing
const storage = createStorage()
storage.set('test:key', { data: 'value' })

// Verify
const value = storage.get('test:key')
expect(value?.data).toBe('value')

// Clean up
storage.clear()
```

## Migration and Backup

```typescript
// Export current storage
const backup = storage.export()

// Save to file
const json = JSON.stringify(backup)

// Later: Restore
const newStorage = createStorage()
newStorage.import(JSON.parse(json))
```

## Best Practices

1. **Use namespaces** to organize data by type
2. **Tag important entries** for easy querying
3. **Enable encryption** for sensitive data (agent memory, keys)
4. **Monitor storage size** and implement cleanup policies
5. **Regular backups** for production systems
6. **Log all operations** for audit trail compliance
7. **Use metadata** for version tracking and filtering

## Limitations

- **Mock Encryption**: Current implementation uses simple XOR. Use real AES in production.
- **In-Memory**: Data is stored in memory (not persisted). Implement DB backend for production.
- **No Sharding**: All data in single instance. Distribute for large-scale systems.
- **Synchronous**: All operations are synchronous. Consider async API for network storage.

## Future Enhancements

- [ ] Real AES-256-GCM encryption
- [ ] Database persistence (PostgreSQL, MongoDB)
- [ ] Distributed storage nodes
- [ ] Async I/O operations
- [ ] Compression for large entries
- [ ] TTL (time-to-live) for entries
- [ ] Replication and sync
- [ ] ACL and access control

## Production Readiness

### Current Status (Development)
✅ Core functionality complete  
✅ Type safe with TypeScript  
✅ Mock encryption implemented  
✅ Event logging system  
✅ Query and search  
✅ Backup/restore  

### Production Needs
⚠️ Real encryption required  
⚠️ Database persistence required  
⚠️ Distributed storage integration needed  
⚠️ Authentication & authorization  
⚠️ Rate limiting & quotas  

## Support

For questions or issues with the storage service, refer to the Hustl3 documentation or contact the development team.

---

**Status**: ✅ READY FOR TESTING  
**Version**: 1.0.0  
**Date**: 2026-05-01
