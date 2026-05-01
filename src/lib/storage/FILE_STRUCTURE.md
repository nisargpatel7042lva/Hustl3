# Storage System File Structure

```
src/lib/storage/
├── storage.ts                  (350 lines)
│   └── StorageService class
│       ├── set(key, value, options)     - KV store with encryption
│       ├── get(key, decrypt)            - Retrieve with auto-decrypt
│       ├── has(key)                     - Check existence
│       ├── delete(key)                  - Remove entry
│       ├── query(options)               - Search by pattern/tag/time
│       ├── appendLog(event)             - Add audit event
│       ├── getLogs(query)               - Get filtered logs
│       ├── getStats()                   - Usage statistics
│       ├── export()                     - Backup to JSON
│       ├── import(data)                 - Restore from JSON
│       ├── enableEncryption()           - Enable encryption
│       ├── disableEncryption()          - Disable encryption
│       ├── rotateKey(newKey)            - Rotate encryption key
│       ├── getSize()                    - Get total size
│       ├── setNamespace(ns)             - Set data namespace
│       └── keys()                       - Get all keys
│
├── encryption.ts               (150 lines)
│   ├── SimpleEncryption class
│   │   ├── encrypt(data)                - Mock XOR encryption
│   │   ├── decrypt(encrypted)           - Mock XOR decryption
│   │   └── setKey(key)                  - Update key
│   ├── EncryptionService class
│   │   ├── encrypt(data)                - Wrapper encryption
│   │   ├── decrypt(encrypted)           - Wrapper decryption
│   │   ├── setKey(key)                  - Set encryption key
│   │   ├── setEnabled(enabled)          - Toggle encryption
│   │   ├── isEnabled()                  - Check status
│   │   └── getAlgorithm()               - Get algorithm
│   ├── createEncryptionService()        - Factory function
│   ├── encrypt(data, key)               - Direct encryption
│   └── decrypt(encrypted, key)          - Direct decryption
│
├── types.ts                    (50 lines)
│   ├── StorageEntry<T>                  - KV pair with metadata
│   ├── LogEntry                         - Event log entry
│   ├── StorageStats                     - Statistics object
│   ├── StorageQuery                     - Query parameters
│   ├── StorageNamespace                 - Namespace types
│   └── EncryptionOptions                - Encryption config
│
├── index.ts                    (40 lines)
│   ├── Re-exports all public APIs
│   ├── getStorage()                     - Get singleton instance
│   ├── initializeStorage()              - Create new instance
│   └── resetStorage()                   - Clear singleton
│
├── examples.ts                 (400 lines)
│   ├── exampleAgentMemory()              - Store agent state
│   ├── exampleSkillStorage()             - Store skills
│   ├── exampleGigStorage()               - Store marketplace gigs
│   ├── exampleAuditTrail()               - Event logging
│   ├── exampleBackup()                   - Backup/restore
│   ├── exampleNamespaces()               - Namespace usage
│   └── runStorageExamples()              - Run all examples
│
├── STORAGE_README.md           (300 lines)
│   ├── Overview and features
│   ├── Core API documentation
│   ├── Usage examples
│   ├── Type definitions
│   ├── Performance characteristics
│   ├── Error handling
│   ├── Best practices
│   └── Future enhancements
│
└── INTEGRATION_GUIDE.md        (400 lines)
    ├── Quick integration (5 min)
    ├── 10 practical examples
    │   1. Basic setup
    │   2. Save agent memory
    │   3. Store agent skills
    │   4. Query skills
    │   5. Store gigs
    │   6. Log payments
    │   7. Recover agent
    │   8. Monitor performance
    │   9. Encryption
    │   10. Backup/recovery
    ├── Complete working example
    ├── Integration checklist
    └── Next steps
```

## Core Classes

### StorageService
```typescript
class StorageService {
  private store: Map<string, StorageEntry>
  private logs: LogEntry[]
  private encryption: EncryptionService
  private namespace: StorageNamespace
  
  set<T>(key, value, options?)
  get<T>(key, decrypt = true): T | undefined
  appendLog(event): LogEntry
  query(options?): StorageEntry[]
  getLogs(query?): LogEntry[]
  export(): { entries, logs, stats }
  import(data)
  // ... and more
}
```

### EncryptionService
```typescript
class EncryptionService {
  private simple: SimpleEncryption
  private options: EncryptionOptions
  
  encrypt(data): string
  decrypt<T>(encrypted): T
  setKey(key)
  setEnabled(enabled)
  isEnabled(): boolean
  getAlgorithm(): string
}
```

## API Surface

### Public Functions
```typescript
// Singleton access
getStorage(): StorageService
initializeStorage(encryption?): StorageService
resetStorage(): void

// Factory
createStorage(encryption?): StorageService
createEncryptionService(algorithm?, enabled?): EncryptionService

// Direct encryption
encrypt(data, key?): string
decrypt<T>(encrypted, key?): T
```

### StorageService Methods

**Data Operations**
- `set<T>(key, value, options?)`: Store value
- `get<T>(key, decrypt?)`: Retrieve value
- `has(key)`: Check existence
- `delete(key)`: Remove entry
- `clear()`: Clear all storage

**Querying**
- `query(options?)`: Search entries
- `keys()`: Get all keys
- `getEntry(key)`: Get entry with metadata

**Logging**
- `appendLog(event)`: Add event
- `getLogs(query?)`: Get filtered logs

**Management**
- `getStats()`: Storage statistics
- `getSize()`: Total size in bytes
- `export()`: Backup to JSON
- `import(data)`: Restore from JSON

**Namespacing**
- `setNamespace(ns)`: Set current namespace
- `getNamespace()`: Get current namespace

**Encryption**
- `enableEncryption(key?)`: Enable encryption
- `disableEncryption()`: Disable encryption
- `rotateKey(newKey)`: Rotate encryption key

## Data Models

### StorageEntry<T>
```typescript
{
  key: string
  value: T
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
  encryption: {
    enabled: boolean
    keysUsed: number
  }
}
```

## Namespaces

```typescript
type StorageNamespace =
  | 'agent'   // Agent state and memory
  | 'skill'   // Skills and capabilities
  | 'gig'     // Marketplace gigs
  | 'task'    // Task execution
  | 'user'    // User profiles
  | 'system'  // System data
```

## Integration Examples

### With Agent Runtime
```typescript
storage.setNamespace('agent')
storage.set(`${agent.id}:state`, agent.getInfo(), {
  encrypt: true,
  tags: ['state', 'critical']
})
```

### With Skills
```typescript
storage.setNamespace('skill')
storage.set(skill.id, skill, {
  tags: [skill.category],
  metadata: { version: skill.version }
})
```

### With Gigs
```typescript
storage.setNamespace('gig')
storage.set(gig.id, gig, {
  tags: [gig.tier, ...gig.skills]
})
```

## Lines of Code

| File | Lines | Purpose |
|------|-------|---------|
| storage.ts | 350 | Core KV storage service |
| encryption.ts | 150 | Encryption/decryption |
| types.ts | 50 | Type definitions |
| index.ts | 40 | Public API |
| examples.ts | 400 | 6 practical examples |
| STORAGE_README.md | 300 | User guide |
| INTEGRATION_GUIDE.md | 400 | Integration manual |
| **Total** | **~1690** | **Complete system** |

---

Ready to use in agent runtime! See INTEGRATION_GUIDE.md for practical examples.
