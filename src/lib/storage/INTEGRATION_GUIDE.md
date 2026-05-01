# Storage + Agent Runtime Integration Guide

## Quick Integration

Integrate the storage service into your agent runtime for persistent memory and state management.

### 1. Basic Setup

```typescript
import { Agent, AgentManager } from '@/lib/agents/core'
import { getStorage } from '@/lib/storage'

// Initialize storage
const storage = getStorage()
storage.setNamespace('agent')

// Create agent manager
const manager = new AgentManager()

// Create agents
const agent = manager.createAgent({
  id: 'luna-01',
  name: 'Luna',
  role: 'planner'
})

// Store agent state
const agentState = {
  ...agent.getInfo(),
  memory: agent.getMemory(),
  executions: agent.getExecutionHistory(),
  triggers: agent.getEvolutionTriggers()
}

storage.set(`${agent.id}:state`, agentState, {
  encrypt: true,
  tags: ['agent-state', 'critical'],
  metadata: { agentId: agent.id }
})
```

### 2. Save Agent Memory After Goal Execution

```typescript
async function executeGoalWithStorage(agent: Agent, goal: Goal) {
  try {
    // Execute goal
    await agent.receiveGoal(goal)
    
    // Save memory to storage
    storage.set(`${agent.id}:memory`, agent.getMemory(), {
      encrypt: true,
      tags: ['memory', 'critical'],
      metadata: {
        goalId: goal.id,
        timestamp: new Date().toISOString()
      }
    })
    
    // Log success
    storage.appendLog({
      type: 'agent:execution',
      action: 'goal_completed',
      agentId: agent.id,
      entityId: goal.id,
      entityType: 'agent',
      data: {
        goalTitle: goal.title,
        taskCount: agent.getInfo().taskCount
      },
      status: 'success'
    })
  } catch (error) {
    // Log error
    storage.appendLog({
      type: 'agent:error',
      action: 'goal_failed',
      agentId: agent.id,
      entityId: goal.id,
      entityType: 'agent',
      data: { goalTitle: goal.title },
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}
```

### 3. Store Agent Skills

```typescript
storage.setNamespace('skill')

// Add skill to storage when agent learns it
function learnNewSkill(agent: Agent, skill: AgentSkill) {
  // Add to agent
  agent.addNewSkill(skill)
  
  // Store in database
  storage.set(skill.id, skill, {
    tags: [skill.category, 'active'],
    metadata: {
      agentId: agent.id,
      version: skill.version,
      enabled: skill.enabled
    }
  })
  
  // Log evolution
  storage.appendLog({
    type: 'agent:evolution',
    action: 'skill_added',
    agentId: agent.id,
    entityId: skill.id,
    entityType: 'skill',
    data: {
      skillName: skill.name,
      category: skill.category,
      version: skill.version
    },
    status: 'success'
  })
}
```

### 4. Query Agent Skills

```typescript
// Find all skills for an agent
function getAgentSkills(agentId: string): AgentSkill[] {
  storage.setNamespace('skill')
  
  const entries = storage.query({
    keyPattern: /skill-\d+/ // Adjust pattern as needed
  })
  
  return entries
    .filter(entry => entry.metadata?.agentId === agentId)
    .map(entry => entry.value as AgentSkill)
}

// Find skills by category
function getSkillsByCategory(category: string): AgentSkill[] {
  storage.setNamespace('skill')
  
  return storage
    .query({ tag: category })
    .map(entry => entry.value as AgentSkill)
}
```

### 5. Store Gig Listings

```typescript
storage.setNamespace('gig')

// When agent lists a service/gig
function listGig(gig: GigListing) {
  storage.set(gig.id, gig, {
    tags: [gig.tier, gig.status, ...gig.skills],
    metadata: {
      seller: gig.seller,
      rating: gig.rating,
      price: gig.price
    }
  })
  
  storage.appendLog({
    type: 'marketplace:gig',
    action: 'gig_listed',
    agentId: gig.seller,
    entityId: gig.id,
    entityType: 'gig',
    data: {
      title: gig.title,
      price: gig.price,
      skills: gig.skills
    },
    status: 'success'
  })
}

// Search for gigs
function findGigs(filters: GigFilter) {
  storage.setNamespace('gig')
  
  return storage.query({
    tag: filters.tier, // e.g., 'premium'
    keyPattern: filters.skillPattern,
    limit: 50
  })
}
```

### 6. Audit Trail and Payments

```typescript
storage.setNamespace('task')

// Log task execution and payment
function completeTask(task: Task, result: TaskResult) {
  storage.set(`${task.id}:result`, result, {
    encrypt: true,
    tags: ['completed'],
    metadata: {
      duration: result.duration,
      quality: result.qualityScore
    }
  })
  
  // Log payment transaction
  storage.appendLog({
    type: 'transaction:payment',
    action: 'payment_processed',
    agentId: task.executor,
    entityId: task.id,
    entityType: 'task',
    data: {
      taskTitle: task.title,
      amount: task.budget,
      buyer: task.buyer,
      seller: task.executor
    },
    status: 'success'
  })
}

// View task history and payments
function getAgentEarnings(agentId: string): number {
  return storage
    .getLogs({
      agentId,
      type: 'transaction:payment',
      status: 'success'
    })
    .reduce((total, log) => total + (log.data.amount as number), 0)
}
```

### 7. Recover Agent State

```typescript
// Load agent from storage
function loadAgent(agentId: string): AgentState {
  storage.setNamespace('agent')
  
  const state = storage.get(`${agentId}:state`)
  if (!state) {
    throw new Error(`Agent ${agentId} not found`)
  }
  
  return state
}

// Restore agent memory
function restoreAgentMemory(agentId: string): AgentMemory {
  storage.setNamespace('agent')
  
  const memory = storage.get(`${agentId}:memory`)
  if (!memory) {
    return {
      conversationHistory: [],
      goalHistory: [],
      taskHistory: [],
      recentErrors: [],
      metadata: {}
    }
  }
  
  return memory
}

// Create agent from stored state
async function recoverAgent(agentId: string): Promise<Agent> {
  const state = loadAgent(agentId)
  
  const agent = new Agent({
    id: state.id,
    name: state.name,
    role: state.role,
    skills: state.skills,
    wallet: state.wallet
  })
  
  // Restore memory would require additional work
  // to populate the agent's internal state
  
  return agent
}
```

### 8. Monitor Agent Performance

```typescript
function getAgentMetrics(agentId: string) {
  const storage = getStorage()
  
  // Get execution logs
  const executions = storage.getLogs({
    agentId,
    type: 'agent:execution'
  })
  
  // Get error logs
  const errors = storage.getLogs({
    agentId,
    status: 'error'
  })
  
  // Get skill acquisitions
  const evolutions = storage.getLogs({
    agentId,
    type: 'agent:evolution'
  })
  
  return {
    totalExecutions: executions.length,
    successRate: executions.filter(e => e.status === 'success').length / executions.length,
    errorCount: errors.length,
    skillsLearned: evolutions.length,
    earnings: getAgentEarnings(agentId)
  }
}

// Display agent dashboard
function displayAgentDashboard(agentId: string) {
  const metrics = getAgentMetrics(agentId)
  
  console.log(`\n🤖 Agent Dashboard: ${agentId}`)
  console.log(`   Executions: ${metrics.totalExecutions}`)
  console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`)
  console.log(`   Errors: ${metrics.errorCount}`)
  console.log(`   Skills Learned: ${metrics.skillsLearned}`)
  console.log(`   Total Earnings: $${metrics.earnings}`)
}
```

### 9. Encryption Configuration

```typescript
import { createEncryptionService, getStorage, initializeStorage } from '@/lib/storage'

// Initialize with encryption for sensitive data
const encryption = createEncryptionService('simple', true)
encryption.setKey('your-secret-key')

initializeStorage(encryption)

const storage = getStorage()

// Store agent credentials securely
storage.set('agent:luna:credentials', {
  walletPrivateKey: '0x...',
  apiKeys: {...}
}, {
  encrypt: true,
  tags: ['credentials', 'critical']
})

// Store is automatically encrypted
// And automatically decrypted on retrieval
const creds = storage.get('agent:luna:credentials')
```

### 10. Backup and Recovery

```typescript
// Create backup periodically
function backupAgentData() {
  const storage = getStorage()
  
  const backup = storage.export()
  
  // Save to file/database
  const timestamp = new Date().toISOString()
  const filename = `backup-${timestamp}.json`
  
  // In production: save to cloud storage
  console.log(`Backup created: ${filename}`)
  console.log(`  Entries: ${backup.entries.length}`)
  console.log(`  Logs: ${backup.logs.length}`)
  console.log(`  Size: ${backup.stats.totalSize} bytes`)
  
  return backup
}

// Restore from backup
function restoreFromBackup(backupData: string) {
  const backup = JSON.parse(backupData)
  
  const storage = getStorage()
  storage.clear()
  storage.import(backup)
  
  console.log('✓ Restored from backup')
}
```

## Complete Example: Agent with Persistent Storage

```typescript
import { Agent, AgentManager } from '@/lib/agents/core'
import { getStorage, createEncryptionService, initializeStorage } from '@/lib/storage'

async function main() {
  // Initialize storage with encryption
  const encryption = createEncryptionService('simple', true)
  initializeStorage(encryption)
  
  const storage = getStorage()
  const manager = new AgentManager()
  
  // Create agents
  const planner = manager.createAgent({
    id: 'planner-01',
    name: 'Luna',
    role: 'planner'
  })
  
  const executor = manager.createAgent({
    id: 'executor-01',
    name: 'Max',
    role: 'executor'
  })
  
  // Store agents
  storage.setNamespace('agent')
  storage.set('planner:state', planner.getInfo(), {
    encrypt: true,
    tags: ['agent-state']
  })
  storage.set('executor:state', executor.getInfo(), {
    encrypt: true,
    tags: ['agent-state']
  })
  
  // Create and execute goal
  const goal: Goal = {
    id: 'goal-001',
    title: 'Build Smart Contract',
    priority: 'high',
    budget: 5000,
    requiredSkills: ['solidity']
  }
  
  // Execute and store results
  const plan = await planner.receiveGoal(goal)
  
  storage.setNamespace('agent')
  storage.set('planner:lastGoal', {
    goalId: goal.id,
    plan: plan,
    completedAt: new Date().toISOString()
  })
  
  storage.appendLog({
    type: 'agent:execution',
    action: 'goal_executed',
    agentId: 'planner-01',
    entityId: goal.id,
    entityType: 'agent',
    data: { goalTitle: goal.title, tasks: plan.tasks.length },
    status: 'success'
  })
  
  // Display results
  const stats = storage.getStats()
  console.log(`\n✅ Goal completed and stored`)
  console.log(`📊 Storage Stats:`)
  console.log(`   Entries: ${stats.totalEntries}`)
  console.log(`   Logs: ${stats.logEntries}`)
  console.log(`   Encrypted: ${stats.encryption.keysUsed} keys`)
}

main().catch(console.error)
```

## Integration Checklist

- [ ] Import storage module
- [ ] Initialize storage with encryption
- [ ] Create agent and execute goal
- [ ] Store agent state after execution
- [ ] Store skills when agent learns
- [ ] Log all major events
- [ ] Query storage for analytics
- [ ] Implement backup strategy
- [ ] Monitor storage size
- [ ] Test recovery from backup

## Performance Tips

1. **Use namespaces** to organize by data type
2. **Encrypt only** sensitive data (agent credentials, transactions)
3. **Tag entries** for efficient querying
4. **Batch operations** to reduce overhead
5. **Archive old logs** to manage size
6. **Monitor storage size** with `getStats()`

## Next Steps

1. Run storage examples: `npm run storage:examples`
2. Review `STORAGE_README.md` for detailed API
3. Implement in agent runtime
4. Add database persistence (PostgreSQL)
5. Set up backup pipeline
6. Monitor metrics in production

---

**Ready to integrate!** Start with the examples and adapt to your needs.
