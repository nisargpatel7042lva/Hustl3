# Agent Runtime Specification

## Document Information
- **Project**: Hustl3 Decentralized Marketplace
- **Component**: Core Agent Runtime System
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: 2026-05-01

## 1. Overview

The Agent Runtime System is the core execution engine for autonomous agents in Hustl3. It enables:
- Independent agent execution with async operations
- Inter-agent communication via event bus
- Goal decomposition and task management
- Self-evolution and skill learning
- Multi-agent coordination and delegation

## 2. Architecture

### 2.1 High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                 Application Layer                        │
│   (Goals, Tasks, User Interactions)                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│            Agent Runtime Layer                           │
│  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │ AgentManager │  │  EventBus   │  │    Agent     │   │
│  │              │  │             │  │              │   │
│  │ • Orchestrate│  │ • Pub/Sub   │  │ • Lifecycle  │   │
│  │ • Delegate   │  │ • Routing   │  │ • Execution  │   │
│  │ • Discover   │  │ • History   │  │ • Evolution  │   │
│  └──────────────┘  └─────────────┘  └──────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│         Integration Layer (External APIs)                │
│   AXL Transport, 0G Storage, Payments, Marketplace      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Core Components

#### 2.2.1 Agent
- **Responsibility**: Execute goals and tasks independently
- **Key Features**:
  - Full lifecycle management (idle → working → waiting → error)
  - Async task execution
  - Memory and state tracking
  - Message-based communication
  - Skill management
  - Evolution triggers

#### 2.2.2 AgentManager
- **Responsibility**: Orchestrate multiple agents
- **Key Features**:
  - Agent creation and lifecycle
  - Goal delegation with intelligent matching
  - Agent discovery and filtering
  - Collective statistics
  - Message history tracking

#### 2.2.3 EventBus
- **Responsibility**: Enable inter-agent communication
- **Key Features**:
  - Publish-subscribe messaging
  - Message routing and filtering
  - Conversation tracking
  - Event history with size limits
  - Async message delivery

## 3. Core Execution Loop

### 3.1 Agent Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ Agent Lifecycle State Machine                            │
└─────────────────────────────────────────────────────────┘

    IDLE (Starting state)
      ↓
    WORKING (Processing goal/task)
      ├→ WAITING (Awaiting response from other agents)
      │    ↓
      │  WORKING (Resume)
      ├→ ERROR (Execution failed)
      │    ↓
      │  IDLE (Reset after error)
      ↓
    IDLE (After completion)
```

### 3.2 Goal Execution Flow

```
receiveGoal(goal)
├─ Set state: WORKING
├─ planTasks(goal)
│  └─ Decompose goal into executable tasks
│     └─ Identify risks and missing skills
│
├─ for each task in plan:
│  ├─ executeTask(task)
│  │  ├─ Set task status: IN_PROGRESS
│  │  │
│  │  ├─ executeTaskInternal()
│  │  │  └─ Run skill or send message to another agent
│  │  │
│  │  ├─ sendMessage(to, subject, payload)
│  │  │  ├─ Create AgentMessage
│  │  │  ├─ Publish via EventBus
│  │  │  └─ waitForResponse (timeout: 5s)
│  │  │
│  │  ├─ receiveResponse()
│  │  │  ├─ Get response from EventBus
│  │  │  └─ Process response
│  │  │
│  │  ├─ evaluateResult(task)
│  │  │  ├─ Score result (0-100)
│  │  │  ├─ Provide feedback
│  │  │  └─ Suggest improvements
│  │  │
│  │  ├─ if (score < 70):
│  │  │  └─ triggerEvolution()
│  │  │     ├─ Record trigger
│  │  │     └─ Add new skills if applicable
│  │  │
│  │  └─ Set task status: COMPLETED/FAILED
│  │
│  └─ Record ExecutionContext
│
└─ Set state: IDLE (on success) or ERROR (on failure)
```

### 3.3 Message Exchange Protocol

```
Agent A (Requester)          EventBus             Agent B (Responder)
    │                           │                       │
    ├─ sendMessage() ─────────────►                     │
    │  (AgentMessage                                    │
    │   type: 'request'                                 │
    │   replyTo: null)                                  │
    │                           │                       │
    │                           ├─────► receiveMessage()│
    │                           │       (custom handler)│
    │                           │       processRequest()│
    │                           │                       │
    │                           │◄───── publishMessage()│
    │                           │  (AgentMessage        │
    │   waitForResponse()◄───────┤   type: 'response'   │
    │   (msg.replyTo = request)  │   replyTo: msg.id)   │
    │                           │                       │
    └─ Process Response ─ Complete
```

## 4. Type System

### 4.1 Key Types

**AgentState**
```typescript
type AgentState = 'idle' | 'working' | 'waiting' | 'error'
```

**AgentRole**
```typescript
type AgentRole =
  | 'planner'    // Decompose goals, delegate tasks
  | 'researcher' // Gather info, analyze data
  | 'executor'   // Execute tasks, deliver results
  | 'critic'     // Evaluate work, provide feedback
  | 'seller'     // Sell services, manage marketplace
  | 'auditor'    // Monitor agents, track compliance
```

**AgentMessage** - Inter-agent communication
```typescript
{
  id: string
  from: string                        // Sender agent ID
  to: string                          // Receiver agent ID
  type: 'request' | 'response' | 'event' | 'broadcast'
  subject: string                     // Message topic
  payload: unknown                    // Data
  conversationId?: string             // Link related messages
  replyTo?: string                    // References original message
  timestamp: Date
}
```

## 5. Integration Points

### 5.1 AXL Transport (Siddharth's Module)

**Assumption**: `axl.send(to, payload, from)` exists and is integrated

```typescript
// Agent uses AXL for off-chain messaging
const result = await axl.send(
  recipientAddress,
  JSON.stringify(message.payload),
  agent.wallet.address
);
```

**Integration in Agent**:
- Messages can be sent via AXL for cross-chain compatibility
- Requires: `agent.wallet.address` (ENS or Ethereum address)
- Returns: Message ID and delivery status

### 5.2 Marketplace API (agentmarket.query)

**Assumption**: Agent marketplace API exists for querying available services

```typescript
// Agent queries marketplace for available agents/services
const result = await agentmarket.query({
  tier: 'premium',
  skillName: 'solidity',
  priceMax: 5000
});
```

**Integration in Agent**:
- Agents can search for specialized agents to hire
- Planner role agents use this to find executors
- Returns: List of available gigs/agents

### 5.3 Payments (x402.pay)

**Assumption**: x402 payment API exists for micro-transactions

```typescript
// Agent pays another agent for services
const receipt = await x402.pay(
  recipientAddress,
  amountInWei,
  'Service execution'
);
```

**Integration in Agent**:
- Wallet balance management: `agent.wallet.balance`
- Payment on task completion
- Escrow integration for safety

### 5.4 KeeperHub (keeperhub.execute)

**Assumption**: KeeperHub automation API exists

```typescript
// Agent schedules recurring tasks
const job = await keeperhub.execute(
  'recurring-payment',
  { frequency: 'daily', amount: 100 }
);
```

**Integration in Agent**:
- Schedule automated tasks
- Recurring payments
- Contract interactions

### 5.5 0G Storage & Compute

**Assumption**: ZeroGStorage and ZeroGCompute classes exist

```typescript
// Store agent memory/results
const cid = await storage.upload(JSON.stringify(agentMemory));

// Execute compute jobs
const result = await compute.execute(skillCode, input);
```

**Integration in Agent**:
- Persist execution history
- Store evolved skills
- Off-chain computation

## 6. Design Patterns

### 6.1 Observer/Pub-Sub Pattern
**Implementation**: EventBus with subscriptions
**Purpose**: Decouple agents from direct dependencies

### 6.2 Factory Pattern
**Implementation**: `AgentManager.createAgent()`
**Purpose**: Centralized agent creation with consistent configuration

### 6.3 Strategy Pattern
**Implementation**: Agent roles define behavior
**Purpose**: Different strategies for different agent types

### 6.4 Command Pattern
**Implementation**: Goal → Task → ExecutionContext
**Purpose**: Encapsulate and queue work

### 6.5 Template Method Pattern
**Implementation**: Agent.executeTask() with overrideable executeTaskInternal()
**Purpose**: Allow customization while maintaining core flow

## 7. Performance Characteristics

### 7.1 Complexity Analysis

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Agent creation | O(1) | Simple object initialization |
| Goal decomposition | O(n) | n = number of required skills |
| Goal delegation | O(m) | m = number of agents, with skill matching |
| Message publish | O(k) | k = number of subscribers |
| Message lookup | O(1) | Map-based storage |
| History retrieval | O(n) | n = message count (limited to 1000) |

### 7.2 Resource Management

- **Message History**: Limited to 1000 most recent messages
- **Execution Context**: Kept in memory (consider persistence)
- **Agent Memory**: Local to agent (no shared state)
- **Event Handlers**: Cleaned up on unsubscribe

### 7.3 Scalability Considerations

**Horizontal Scaling**:
- Each agent runs independently
- EventBus handles multiple agents efficiently
- Message routing is O(k) where k = subscribers

**Vertical Scaling**:
- Message history buffer (1000 limit)
- Consider persistence for long-running agents
- Execution context could be archived

## 8. Error Handling

### 8.1 Error Scenarios

| Scenario | Handling | Recovery |
|----------|----------|----------|
| Task execution fails | Catch & record error | Set state: ERROR, trigger evolution |
| Message timeout (5s) | Promise rejection | Reject goal, record error |
| Skill not found | Error thrown | Agent cannot execute task |
| Missing required skills | Risk identified in plan | Goal proceeds with warnings |
| Invalid agent ID | AgentManager throws | User must retry with valid ID |

### 8.2 Error Recovery

```typescript
try {
  await agent.receiveGoal(goal);
} catch (error) {
  // Agent state: ERROR
  // Memory: recentErrors populated
  // Triggers: Evolution trigger created
  
  // Can retry after fixing issues
  // Agent resets to IDLE on next successful execution
}
```

## 9. Security Considerations

### 9.1 Current Implementation (Development)

- ⚠️ No authentication (local execution)
- ⚠️ Messages not encrypted (local event bus)
- ✅ Type-safe with TypeScript
- ✅ Input validation for wallet operations
- ✅ Error containment (agent-level)

### 9.2 Production Hardening

- [ ] Authenticate message senders (via wallet signature)
- [ ] Encrypt sensitive payloads
- [ ] Validate skill execution (sandboxing)
- [ ] Rate limiting on message delivery
- [ ] Audit logging of all operations
- [ ] Wallet security (private key management)

## 10. Future Enhancements

### 10.1 Planned Features

```
Phase 2: Persistence
├─ Database storage for execution history
├─ Agent state snapshots
└─ Message archiving

Phase 3: Advanced Coordination
├─ Multi-goal orchestration
├─ Resource allocation and constraints
├─ Priority-based task scheduling
└─ Inter-agent learning/knowledge sharing

Phase 4: Distributed Execution
├─ Remote agent deployment
├─ Cross-network communication
├─ Consensus mechanisms
└─ Distributed state management

Phase 5: Intelligence
├─ ML-based agent improvement
├─ Reinforcement learning for task assignment
├─ Predictive resource allocation
└─ Anomaly detection
```

### 10.2 Integration Roadmap

```
Current (v1.0):
└─ Core agent system with local event bus

Q2 2026:
└─ AXL transport integration
└─ Marketplace API integration
└─ Basic payment integration

Q3 2026:
└─ Full x402 payment system
└─ KeeperHub automation
└─ 0G storage integration

Q4 2026:
└─ Production hardening
└─ Security audits
└─ Distributed agent support
```

## 11. Testing Strategy

### 11.1 Unit Tests
- Agent lifecycle management
- Message creation and routing
- Task execution flow
- Evolution trigger logic

### 11.2 Integration Tests
- Multi-agent communication
- Goal delegation and matching
- EventBus message delivery
- AgentManager operations

### 11.3 End-to-End Tests
- Complete goal execution flow
- Agent evolution cycle
- Team collaboration scenarios
- Error recovery workflows

## 12. Monitoring & Observability

### 12.1 Built-in Metrics

```typescript
// Agent-level metrics
agent.getInfo() // Current state and stats
agent.getMemory() // Conversation history, tasks, errors
agent.getExecutionHistory() // All executions with timing
agent.getEvolutionTriggers() // Evolution events

// System-level metrics
manager.getStats() // Team stats, success rates, task counts
manager.getMessageHistory() // All messages
manager.getConversation(a1, a2) // Agent-pair conversation
```

### 11.2 Logging
- Agent state changes logged to console
- Message sends/receives logged
- Evolution triggers logged
- Error conditions logged

### 12.3 Future: Metrics Aggregation
- Distributed tracing
- Performance metrics database
- Real-time dashboard
- Alert system

## 13. Configuration

### 13.1 Agent Configuration

```typescript
interface AgentConfig {
  id: string;              // Unique identifier
  name: string;            // Human-readable name
  role: AgentRole;         // Behavioral role
  skills?: AgentSkill[];   // Initial capabilities
  wallet?: AgentWallet;    // Payment info
  eventBus?: EventBus;     // Custom event bus (optional)
}
```

### 13.2 System Configuration

```typescript
const manager = new AgentManager(
  eventBus  // Optional: use custom event bus
);

// EventBus configuration
const eventBus = new EventBus();
// Message history: 1000 messages (hardcoded)
// Message timeout: 5000ms (in Agent.waitForResponse)
```

## 14. Deployment

### 14.1 Development
```bash
npm run dev
import { runAgentDemo } from '@/lib/agents/examples'
await runAgentDemo()
```

### 14.2 Production
```bash
npm run build
// Ensure agents are properly initialized
// Monitor metrics and errors
// Set up alerting for failures
```

## 15. Glossary

| Term | Definition |
|------|-----------|
| Goal | High-level objective submitted to an agent |
| Task | Atomic unit of work decomposed from a goal |
| Skill | Capability an agent can execute |
| ExecutionContext | Record of a task execution with timing |
| EvolutionTrigger | Event that prompts agent to learn new skills |
| Message | Communication unit between agents |
| EventBus | Central routing system for agent messages |
| AgentManager | Orchestrator for multiple agents |

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-01  
**Author**: Agent Runtime Development Team  
**Status**: READY FOR INTEGRATION
