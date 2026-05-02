# Hustl3 Agent Runtime System

A modular, production-ready agent system for autonomous agents that can collaborate, communicate, and evolve in a decentralized marketplace.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Agent Manager                         │
│        (Orchestrates multiple agents)                   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
    ┌───▼──┐   ┌────▼──┐   ┌────▼──┐    ┌─────▼──┐
    │Agent │   │Agent  │   │Agent  │    │Agent  │
    │ (1)  │   │ (2)   │   │ (3)   │    │ (n)  │
    └─┬────┘   └─┬─────┘   └───┬──┘    └──┬───┘
      │          │             │          │
      └──────────┼─────────────┼──────────┘
                 │ EventBus    │
            ┌────┴─────────────┴───┐
            │  Message Routing     │
            │  Event Publishing    │
            │  History Tracking    │
            └──────────────────────┘
```

## Core Components

### 1. **Agent Class** (`Agent.ts`)

An autonomous agent with its own lifecycle, state management, and execution capabilities.

#### Key Properties:
- `id` - Unique identifier
- `name` - Human-readable name
- `role` - One of: `planner`, `researcher`, `executor`, `critic`, `seller`, `auditor`
- `state` - Current state: `idle`, `working`, `waiting`, `error`
- `skills` - Array of capabilities
- `wallet` - Payment info
- `memory` - Local context

#### Core Loop:
```
receiveGoal(goal)
  ↓
planTasks(goal)
  ↓
executeTask()
  ├→ sendMessage() to other agents
  ├→ receiveResponse()
  └→ evaluateResult()
      ↓
evaluateResult(task)
  ↓
triggerEvolution() if needed
```

#### Key Methods:
```typescript
// Main entry point
await agent.receiveGoal(goal)

// Communication
await agent.sendMessage(to, subject, payload)

// Message handling
agent.registerMessageHandler(subject, handler)

// Skills
agent.addNewSkill(skill)

// Info
agent.getInfo()
agent.getMemory()
agent.getExecutionHistory()
```

### 2. **EventBus Class** (`EventBus.ts`)

Central hub for inter-agent communication using publish-subscribe pattern.

#### Features:
- Message routing between agents
- Message history tracking
- Conversation tracking
- Event filtering and subscription
- Async message delivery

#### Key Methods:
```typescript
// Subscribe to events
const unsubscribe = bus.subscribe('event-type', handler)

// Publish messages
await bus.publishMessage(message)

// Get history
const messages = bus.getMessageHistory()
const conversation = bus.getConversation(agent1, agent2)
```

### 3. **AgentManager Class** (`AgentManager.ts`)

Orchestrates multiple agents and coordinates their activities.

#### Features:
- Agent creation and management
- Goal delegation to best-matching agent
- Agent discovery and filtering
- Collective statistics
- Message history tracking

#### Key Methods:
```typescript
// Create agent
const agent = manager.createAgent(config)

// Get agents
const agent = manager.getAgent(id)
const agents = manager.getAgentsByRole(role)

// Manage goals
await manager.submitGoal(agentId, goal)
const agentId = await manager.delegateGoal(goal)

// Get info
manager.getStats()
manager.getConversation(agent1Id, agent2Id)
```

## Types & Interfaces

### Goal
```typescript
interface Goal {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  deadline?: Date
  requiredSkills?: string[]
  budget?: number
  metadata?: Record<string, unknown>
}
```

### Task
```typescript
interface Task {
  id: string
  goalId: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  assignedAgent?: string
  result?: unknown
  error?: string
}
```

### AgentMessage
```typescript
interface AgentMessage {
  id: string
  from: string
  to: string
  type: 'request' | 'response' | 'event' | 'broadcast'
  subject: string
  payload: unknown
  conversationId?: string
  replyTo?: string
  timestamp: Date
}
```

### AgentSkill
```typescript
interface AgentSkill {
  id: string
  name: string
  description: string
  category: string
  version: string
  enabled: boolean
  metadata?: Record<string, unknown>
}
```

## Usage Examples

### Basic Setup
```typescript
import { AgentManager } from '@/lib/agents/core'

// Create manager
const manager = new AgentManager()

// Create agents
const planner = manager.createAgent({
  id: 'planner-01',
  name: 'Luna',
  role: 'planner',
  skills: [...],
  wallet: { address: '0x...', balance: 1000, pendingBalance: 0 }
})

const executor = manager.createAgent({
  id: 'executor-01',
  name: 'Max',
  role: 'executor',
  skills: [...],
  wallet: { address: '0x...', balance: 500, pendingBalance: 0 }
})
```

### Submit a Goal
```typescript
const goal: Goal = {
  id: 'goal-001',
  title: 'Build API Integration',
  description: 'Integrate payment API',
  priority: 'high',
  requiredSkills: ['skill-coding', 'skill-testing'],
  budget: 2000
}

// Method 1: Submit to specific agent
await manager.submitGoal('planner-01', goal)

// Method 2: Delegate to best matching agent
const assignedAgentId = await manager.delegateGoal(goal)
```

### Handle Messages
```typescript
// Register custom handler
executor.registerMessageHandler('execute_task', async (msg) => {
  console.log('Executing task:', msg.payload)
  // Do work...
  // Send response
})

// Or listen at event bus level
manager.getEventBus().onMessage((msg) => {
  console.log(`${msg.from} → ${msg.to}: ${msg.subject}`)
})
```

### Get Agent Information
```typescript
const info = agent.getInfo()
// Returns: {id, name, role, state, skills, wallet, taskCount, successRate}

const stats = manager.getStats()
// Returns: {totalAgents, agentsByRole, activeAgents, totalTasks, averageSuccessRate}

const conversation = manager.getConversation('agent1', 'agent2')
const allMessages = manager.getMessageHistory()
```

## Agent Roles

Each agent has a specific role that determines its behavior:

### Planner
- Decomposes complex goals into tasks
- Assigns tasks to appropriate agents
- Tracks overall progress
- Makes strategic decisions

### Researcher
- Gathers information
- Analyzes data
- Provides insights
- Supports decision-making

### Executor
- Performs assigned tasks
- Reports progress
- Delivers results
- Handles execution errors

### Critic
- Evaluates work quality
- Provides feedback
- Scores results
- Suggests improvements

### Seller
- Lists services on marketplace
- Negotiates with buyers
- Manages pricing
- Handles transactions

### Auditor
- Monitors agent activities
- Tracks compliance
- Audits results
- Reports metrics

## Message Flow Example

```
1. Planner receives goal
   ┌─────────────────────────┐
   │ Goal: Build Integration │
   └────────────┬────────────┘
                │
2. Planner sends request to Executor
   Planner ──→ "execute_task" ──→ Executor
                (message_001)
                │
3. Executor processes task
   Executor processes... (100ms)
                │
4. Executor sends response
   Planner ←─ "task_completed" ←─ Executor
                (reply to message_001)
                │
5. Planner evaluates result
   ┌──────────────────────┐
   │ Evaluation: Success  │
   │ Score: 85/100        │
   └──────────────────────┘
```

## Self-Evolution

Agents can trigger evolution based on:
- **Success threshold**: Achieved high success rates
- **Error pattern**: Consistent failures
- **Manual trigger**: Explicit upgrade requests
- **Auto suggestion**: System-recommended improvements

```typescript
// Evolution triggers automatically when:
const triggers = agent.getEvolutionTriggers()
// Returns: [
//   {type: 'success_threshold', description: '...', priority: 'low'},
//   {type: 'error_pattern', description: '...', priority: 'high'},
// ]
```

New skills are added via:
```typescript
agent.addNewSkill({
  id: 'skill-newcap',
  name: 'New Capability',
  description: 'Learned from executions',
  category: 'learned',
  version: '1.0.0',
  enabled: true
})
```

## Production Considerations

### Scalability
- Event bus uses efficient Set-based subscriptions
- Message history is size-limited (1000 messages)
- Async execution prevents blocking
- Agents run independently

### Reliability
- Error handling with try-catch blocks
- Automatic state management
- Message timeout handling (5 second default)
- Execution history tracking

### Extensibility
- Custom message handlers via `registerMessageHandler()`
- Extendable agent roles
- Pluggable EventBus
- Customizable skill system

### Integration
- Ready for AXL transport integration
- Compatible with 0G storage/compute
- Payment system integration hooks
- Marketplace API hooks

## Running Examples

```bash
# Run agent demos
npm run dev

# Then import and run:
import { runAgentDemo, runComplexWorkflow } from '@/lib/agents/examples'

await runAgentDemo()
await runComplexWorkflow()
```

## Future Enhancements

- [ ] Persistent state storage
- [ ] Distributed agent deployment
- [ ] Advanced scheduling/queuing
- [ ] Resource allocation and constraints
- [ ] Inter-agent learning/knowledge sharing
- [ ] Complex workflow orchestration
- [ ] Real payment integration
- [ ] On-chain state verification

## Key Design Principles

1. **Clarity > Complexity** - Simple, understandable code
2. **Modularity** - Each component has single responsibility
3. **Extensibility** - Easy to add new roles, skills, handlers
4. **Async-first** - Non-blocking operations throughout
5. **Type Safety** - Full TypeScript support
6. **Production-ready** - Error handling, validation, logging
7. **Independent execution** - Agents run without blocking each other
8. **Clean communication** - Well-defined message format

## File Structure

```
src/lib/agents/
├── core/
│   ├── Agent.ts          # Core agent class
│   ├── AgentManager.ts   # Multi-agent orchestration
│   ├── EventBus.ts       # Message routing
│   ├── types.ts          # Type definitions
│   └── index.ts          # Public API
├── examples.ts           # Usage examples
├── types.ts              # Existing types (keep)
├── AgentRuntime.ts       # Existing runtime (keep)
└── ...
```

## Support & Contributions

For questions, issues, or improvements to the agent runtime system, refer to the Hustl3 project documentation and team guidelines.
