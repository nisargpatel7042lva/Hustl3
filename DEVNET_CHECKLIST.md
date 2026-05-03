# Hustl3 Devnet Production-Ready Checklist

**Target**: Fully functional decentralized marketplace on devnet (Base Sepolia / 0G testnet)  
**Timeline**: Phase-based with clear dependencies  
**Status**: 🟡 YELLOW (UI complete, infrastructure setup needed)

---

## 📊 Priority Tiers & Execution Order

```
TIER 1: INFRASTRUCTURE & FOUNDATIONS (Days 1-2)
├─ Local 0G Stack Setup
├─ Environment Configuration
├─ Mock Fallbacks for Graceful Degradation
└─ Smart Contract Compilation

TIER 2: API & DATA LAYER (Days 2-3)
├─ Fix Failing API Endpoints
├─ Connect to 0G Storage (KV + Log)
├─ Implement Order State Machine
└─ User Authentication (JWT + SIWE)

TIER 3: WEB3 INTEGRATION (Days 3-4)
├─ Deploy Smart Contracts to Devnet
├─ Connect Wallet (RainbowKit + Wagmi)
├─ ENS Lookups & Storage
└─ Transaction Signing & Broadcasting

TIER 4: PAYMENT & ESCROW (Days 4-5)
├─ x402 Payment Integration
├─ KeeperHub Escrow Setup
├─ Budget Waterfall Distribution
└─ Payment Status Tracking

TIER 5: AGENT EXECUTION (Days 5-6)
├─ Multi-Agent Orchestration (MoA)
├─ 0G Compute Integration
├─ Job Queue (BullMQ) Processing
└─ Reasoning Trace Logging

TIER 6: POLISH & LAUNCH (Days 6-7)
├─ Integration Testing
├─ Error Handling & Rollback
├─ Analytics & Monitoring
├─ Documentation & Runbook
└─ Devnet Launch

```

---

## ✅ TIER 1: INFRASTRUCTURE & FOUNDATIONS

### 1.1 Local 0G Storage Stack
- [ ] **Task**: Install and run 0G Storage locally (Docker or binary)
  - [ ] Download 0G Storage node binary OR Docker image
  - [ ] Start KV store on `localhost:6789`
  - [ ] Start Log store on `localhost:6790`
  - [ ] Verify connectivity: `curl http://localhost:6789/health`
  - [ ] Create test entries in KV
  
  **Command Reference**:
  ```bash
  # Option 1: Docker (recommended)
  docker run -p 6789:6789 -p 6790:6790 0glabs/storage-node:latest
  
  # Option 2: Binary (check 0G Labs docs)
  ./zerog-storage-node --kv-port 6789 --log-port 6790
  ```
  
  **Definition of Done**: 
  - ✅ Both endpoints responding
  - ✅ Can write/read test data
  - ✅ Logs show "Ready"

---

### 1.2 Redis Setup (BullMQ Job Queue)
- [ ] **Task**: Start Redis locally for job queue
  - [ ] Install Redis (Homebrew on Mac: `brew install redis`)
  - [ ] Start Redis: `redis-server`
  - [ ] Verify: `redis-cli ping` returns `PONG`
  
  **Definition of Done**:
  - ✅ Redis running on `localhost:6379`
  - ✅ Can connect from Node.js

---

### 1.3 Environment Configuration
- [ ] **Task**: Update `.env.local` with infrastructure URLs
  ```bash
  # 0G Storage
  ZEROG_KV_ENDPOINT=http://localhost:6789
  ZEROG_LOG_ENDPOINT=http://localhost:6790
  ZEROG_API_KEY=                    # Optional for now
  
  # Redis
  REDIS_URL=redis://localhost:6379
  
  # RPC Endpoints
  BASE_SEPOLIA_RPC=https://sepolia.base.org
  ZEROG_TESTNET_RPC=https://evmrpc.0g.ai  # From 0G docs
  
  # Private Key (for testing only!)
  PRIVATE_KEY=0x...                  # Test deployer wallet
  WALLET_SEED=                       # Optional
  
  # External APIs
  ETHERSCAN_API_KEY=                 # For verification
  OPENAI_API_KEY=                    # For agent inference
  UNISWAP_API_KEY=                   # For swaps
  KEEPERHUB_API_KEY=                 # For escrow
  ```
  
  **Definition of Done**:
  - ✅ `.env.local` file created with all required vars
  - ✅ No secrets committed to git (added to `.gitignore`)

---

### 1.4 Smart Contract Setup
- [ ] **Task**: Verify contracts compile and are ready for deployment
  ```bash
  cd packages/contracts
  npm ci
  npm run compile
  npm run test
  ```
  
  **Expected Output**:
  - ✅ All tests pass (or identify failures)
  - ✅ Contract ABIs generated in `artifacts/`
  - ✅ No TypeScript errors
  
  **Contracts to Deploy**:
  1. `HustlMarketplace.sol` - Core marketplace (create gigs, list orders)
  2. `HustlEscrow.sol` - Escrow & payment management
  3. `HustlReputation.sol` - Reputation tracking
  4. `AgenticID.sol` - Agent identity & ENS integration
  5. `HustlAgentRegistry.sol` - Agent registry (optional, if needed)

  **Definition of Done**:
  - ✅ All contracts compile without errors
  - ✅ Unit tests pass locally
  - ✅ Ready for testnet deployment

---

### 1.5 Mock Fallback Layer (Graceful Degradation)
- [ ] **Task**: Implement fallback to mock data when 0G is unavailable
  - [ ] Modify `/api/agents` to return mock agents if 0G fails
  - [ ] Modify `/api/gigs` to return mock gigs if 0G fails
  - [ ] Add error logging (Winston) for debugging
  - [ ] Return fallback with `x-fallback: true` header
  
  **Location**: `apps/web/src/lib/storage/zerog.ts`
  
  **Code Pattern**:
  ```typescript
  async function kvGet<T>(key: string): Promise<T | null> {
    try {
      // Try 0G first
      const res = await fetch(`${ZEROG_KV_ENDPOINT}/kv/${key}`);
      if (res.ok) return res.json();
    } catch (err) {
      logger.warn(`0G unavailable, using mock data for ${key}`);
    }
    // Fallback to mock
    return MOCK_DATA[key] ?? null;
  }
  ```
  
  **Definition of Done**:
  - ✅ All GET endpoints return data even if 0G is down
  - ✅ POST endpoints gracefully fail with clear message
  - ✅ Logs show fallback usage

---

## ✅ TIER 2: API & DATA LAYER

### 2.1 Fix Agent Creation API
- [ ] **Task**: Make `POST /api/agents` work end-to-end
  - [ ] Verify 0G KV connectivity in route
  - [ ] Store agent profile in KV: `agents:{walletAddress}:profile`
  - [ ] Initialize agent memory: `agents:{walletAddress}:memory:current`
  - [ ] Log event to 0G Log: `agents.created`
  - [ ] Return full agent object with `createdAt`
  - [ ] Add error handling & validation (Zod schema)
  
  **Validation Schema**:
  ```typescript
  const CreateAgentSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-f0-9]{40}$/i),
    ensName: z.string().optional(),
    ownerWallet: z.string().regex(/^0x[a-f0-9]{40}$/i),
    agentType: z.enum(['ai', 'human', 'hybrid']),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    personality: z.string().optional(),
  });
  ```
  
  **Definition of Done**:
  - ✅ Agent created and stored in 0G KV
  - ✅ POST returns `201 Created` with agent object
  - ✅ Event logged to 0G Log
  - ✅ Can retrieve via `GET /api/agents/{address}`

---

### 2.2 Fix Gig Creation API
- [ ] **Task**: Make `POST /api/gigs` work end-to-end
  - [ ] Generate unique `gigId` (UUID v4)
  - [ ] Store in 0G KV: `gigs:{gigId}:data`
  - [ ] Append to marketplace log: `STREAMS.marketplaceIndex`
  - [ ] Index by category for filtering
  - [ ] Return gig with creation timestamp
  
  **Required Fields**:
  ```typescript
  {
    title: string,
    description: string,
    price: string (USDC),
    category: 'Development' | 'Marketing' | 'Finance' | 'Writing' | 'Other',
    sellerType: 'agent' | 'human',
    sellerWallet: string,
    sellerEns: string (optional),
    deliveryTimeHours: number,
    formatInstructions: string (optional),
  }
  ```
  
  **Definition of Done**:
  - ✅ Gig created and stored
  - ✅ Appears in `GET /api/gigs` list
  - ✅ Can filter by category/seller type
  - ✅ Event logged with category for discovery

---

### 2.3 Fix Order Creation & State Machine
- [ ] **Task**: Implement complete order lifecycle
  
  **Order States**:
  ```
  PAYMENT_PENDING → ACCEPTED → IN_PROGRESS → DELIVERED → COMPLETED
                          ↓
                      CANCELLED
  ```
  
  - [ ] `POST /api/orders` creates order in `PAYMENT_PENDING` state
  - [ ] `POST /api/orders/{id}/accept` → transitions to `ACCEPTED`
  - [ ] `POST /api/orders/{id}/deliver` → transitions to `DELIVERED`
  - [ ] `POST /api/orders/{id}/complete` → transitions to `COMPLETED`
  - [ ] Store full state history with timestamps
  - [ ] Emit events for each transition
  
  **Storage Schema**:
  ```typescript
  {
    orderId: string,
    gigId: string,
    buyerWallet: string,
    sellerWallet: string,
    state: OrderState,
    amount: string, // USDC
    createdAt: number,
    updatedAt: number,
    history: [
      { state: 'PAYMENT_PENDING', timestamp: 123, actor: 'system' },
      { state: 'ACCEPTED', timestamp: 124, actor: sellerWallet },
      // ...
    ],
    deliveryHash: string (optional), // IPFS hash of deliverables
    cancelReason: string (optional),
  }
  ```
  
  **Definition of Done**:
  - ✅ Full state machine implemented
  - ✅ Can create, accept, deliver, complete orders
  - ✅ History tracked in 0G Log
  - ✅ `GET /api/orders/user/{address}` returns all user orders

---

### 2.4 User Authentication (JWT + SIWE)
- [ ] **Task**: Implement secure user sessions
  - [ ] Use Sign-In With Ethereum (SIWE) for wallet sign-in
  - [ ] Issue JWT on successful signature verification
  - [ ] Store session in Redis with 24-hour expiry
  - [ ] Validate JWT on protected routes
  - [ ] Add to API routes that need user context
  
  **Flow**:
  ```
  1. GET /api/auth/nonce → returns random nonce
  2. User signs nonce with wallet
  3. POST /api/auth/verify → { message, signature }
  4. Backend verifies sig → issues JWT
  5. Client stores JWT in localStorage/cookies
  6. Include JWT in Authorization header
  7. Protected routes validate JWT
  ```
  
  **Protected Routes**:
  - `POST /api/agents` - require wallet sign-in
  - `POST /api/gigs` - require wallet sign-in
  - `POST /api/orders` - require wallet sign-in
  - `POST /api/orders/{id}/accept` - require seller wallet
  - `POST /api/orders/{id}/deliver` - require seller wallet
  
  **Definition of Done**:
  - ✅ Can sign in with wallet
  - ✅ JWT issued and stored
  - ✅ Protected routes require valid JWT
  - ✅ Invalid tokens rejected with 401

---

### 2.5 Reputation System (0G KV)
- [ ] **Task**: Track & display seller/agent reputation
  - [ ] Store in `reputation:{walletAddress}:score`
  - [ ] Calculate from completed orders
  - [ ] Display on agent/gig cards
  - [ ] Update after order completion
  
  **Metrics**:
  ```typescript
  {
    walletAddress: string,
    totalOrders: number,
    completedOrders: number,
    successRate: number, // 0-100%
    averageRating: number, // 0-5
    totalEarnings: string, // USDC
    lastUpdated: number,
  }
  ```
  
  **Definition of Done**:
  - ✅ Reputation calculated correctly
  - ✅ Displayed on marketplace
  - ✅ Updated on order completion

---

## ✅ TIER 3: WEB3 INTEGRATION

### 3.1 Deploy Smart Contracts to Devnet
- [ ] **Task**: Deploy all contracts to Base Sepolia
  ```bash
  cd packages/contracts
  npm run deploy -- --network baseSepolia
  ```
  
  **Expected Output**:
  ```
  ✅ HustlMarketplace deployed to: 0x...
  ✅ HustlEscrow deployed to: 0x...
  ✅ HustlReputation deployed to: 0x...
  ✅ AgenticID deployed to: 0x...
  ```
  
  - [ ] Save addresses to `DEPLOYMENT_ADDRESSES.json`:
    ```json
    {
      "baseSepolia": {
        "marketplace": "0x...",
        "escrow": "0x...",
        "reputation": "0x...",
        "agenticId": "0x...",
        "deployedAt": 1234567890
      }
    }
    ```
  
  - [ ] Verify contracts on Basescan
  - [ ] Add to `.env.local`:
    ```bash
    NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x...
    NEXT_PUBLIC_ESCROW_ADDRESS=0x...
    NEXT_PUBLIC_REPUTATION_ADDRESS=0x...
    ```
  
  **Definition of Done**:
  - ✅ All contracts deployed
  - ✅ Verified on block explorer
  - ✅ Addresses in env vars
  - ✅ Contract ABIs available in frontend

---

### 3.2 Wallet Connection (RainbowKit + Wagmi)
- [ ] **Task**: Implement wallet connection UI
  - [ ] Verify RainbowKit config in `packages/ui/lib/wagmi.ts`
  - [ ] Test "Connect Wallet" button on navbar
  - [ ] Support: MetaMask, WalletConnect, Coinbase Wallet
  - [ ] Display connected address / ENS name
  - [ ] Add disconnect option
  
  **Expected UX**:
  ```
  1. Click "Connect Wallet" → modal opens
  2. Select wallet provider
  3. Approve connection in wallet
  4. Address displayed in navbar (short format + copy)
  5. Click menu → "Disconnect"
  ```
  
  **Definition of Done**:
  - ✅ Can connect any supported wallet
  - ✅ Address persists across pages
  - ✅ Can disconnect
  - ✅ No console errors

---

### 3.3 ENS Integration
- [ ] **Task**: Resolve ENS names and display
  - [ ] Use `viem.getEnsName()` to lookup addresses
  - [ ] Use `viem.getEnsAddress()` to lookup names
  - [ ] Cache results in 0G KV: `ens:cache:{address}` (5 min TTL)
  - [ ] Display ENS name if available, else short address
  - [ ] Add ENS names to agent/gig profiles
  
  **Code Pattern**:
  ```typescript
  async function getOrCacheEnsName(address: string) {
    // Check cache first
    const cached = await kvGet(`ens:cache:${address}`);
    if (cached) return cached;
    
    // Lookup via Viem
    const ensName = await getEnsName(publicClient, { address });
    
    // Cache for 5 min
    if (ensName) {
      await kvSet(`ens:cache:${address}`, ensName, { ttl: 300 });
    }
    return ensName;
  }
  ```
  
  **Definition of Done**:
  - ✅ ENS names resolve and display
  - ✅ Caching works
  - ✅ Graceful fallback to address if no ENS

---

### 3.4 Transaction Signing & Broadcasting
- [ ] **Task**: Enable users to sign & send transactions
  - [ ] Use `wagmi.useContractWrite()` for contract interactions
  - [ ] Add loading/error states in UI
  - [ ] Implement transaction receipt polling
  - [ ] Show tx hash with Basescan link
  - [ ] Log all transactions to 0G Log
  
  **Example: Approve Token for Escrow**:
  ```typescript
  const { write: approveUsdc } = useContractWrite({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [ESCROW_ADDRESS, amount],
  });
  
  const handleApprove = async () => {
    approveUsdc?.();
    // Wait for tx confirmation
    // Update UI
  };
  ```
  
  **Definition of Done**:
  - ✅ Can approve USDC for escrow
  - ✅ Can call contract functions
  - ✅ Transaction receipts captured
  - ✅ Error handling for failed txs

---

## ✅ TIER 4: PAYMENT & ESCROW

### 4.1 x402 Payment Integration
- [ ] **Task**: Implement x402 micropayment protocol
  - [ ] Design escrow flow for gig orders
  - [ ] Buyer approves USDC to escrow contract
  - [ ] Payment locked until seller delivers
  - [ ] Seller can withdraw after order marked delivered
  
  **Flow**:
  ```
  1. Order created (PAYMENT_PENDING)
  2. Buyer clicks "Pay" on UI
  3. Approve USDC: approve(escrow, amount)
  4. Initiate payment: initiatePayment(orderId, amount)
  5. Escrow locks USDC
  6. Order state → ACCEPTED
  7. Seller delivers & marks done
  8. Buyer confirms delivery
  9. Escrow releases → seller receives USDC
  ```
  
  - [ ] Implement `POST /api/pay/x402` endpoint:
    ```typescript
    async function initiatePayment(
      orderId: string,
      amount: string,
      buyerWallet: string,
      sellerWallet: string
    ) {
      // 1. Verify order exists & amounts match
      // 2. Call escrow.initiatePayment(orderId, amount)
      // 3. Broadcast tx & wait confirmation
      // 4. Update order state → ACCEPTED
      // 5. Log payment event
      return { transactionHash, escrowAddress };
    }
    ```
  
  - [ ] Implement `POST /api/pay/x402/release` endpoint:
    ```typescript
    async function releaseEscrow(orderId: string) {
      // Only callable by buyer after delivery
      // Call escrow.releasePayment(orderId)
      // Update order state → COMPLETED
      // Update seller reputation
      // Log completion event
    }
    ```
  
  **Definition of Done**:
  - ✅ Can initiate payments via UI
  - ✅ USDC locked in escrow
  - ✅ Can release after delivery
  - ✅ Transactions logged

---

### 4.2 KeeperHub Escrow Setup
- [ ] **Task**: Optional: use KeeperHub for autonomous execution
  - [ ] Register escrow contract with Keeper Network
  - [ ] Set up upkeep for automatic payment release (optional)
  - [ ] Implement fallback for manual release
  
  **Definition of Done** (Optional for MVP):
  - ✅ Manual payment release working
  - ✅ KeeperHub integration optional for v2

---

### 4.3 Budget Waterfall Distribution
- [ ] **Task**: Distribute payments to worker agents (for Tier 3 complex gigs)
  - [ ] When coordinator payment released, split to workers
  - [ ] Implement `budgetWaterfall()` function
  - [ ] Track splits in order metadata
  - [ ] Validate total equals 100%
  
  **Example**:
  ```
  Total Order Payment: 1000 USDC
  Coordinator Fee (10%): 100 USDC → coordinator.eth
  Worker A (40%): 400 USDC → worker-a.eth
  Worker B (40%): 400 USDC → worker-b.eth
  Validation Agent (10%): 100 USDC → validator.eth
  ```
  
  **Definition of Done**:
  - ✅ Can define payment splits
  - ✅ Splits distribute correctly on release
  - ✅ All agents receive payments

---

## ✅ TIER 5: AGENT EXECUTION

### 5.1 Multi-Agent Orchestration (MoA)
- [ ] **Task**: Implement parallel agent execution for complex gigs
  - [ ] Design agent roles: Decomposer, Workers, Validator, Synthesizer
  - [ ] Create job templates for each role
  - [ ] Queue decomposer job on order acceptance
  - [ ] Queue worker jobs in parallel
  - [ ] Queue validator + synthesizer jobs on completion
  
  **Architecture**:
  ```
  Order Accepted
    ↓
  [1] Decomposer Agent
    ├─ Analyzes requirements
    ├─ Breaks into subtasks
    └─ Outputs task spec
    ↓
  [2] N Worker Agents (Parallel via 0G Compute)
    ├─ Worker A: Approach 1 (detail-focused)
    ├─ Worker B: Approach 2 (concise)
    ├─ Worker C: Approach 3 (risk-aware)
    └─ All run in parallel
    ↓
  [3] Validator Agent
    ├─ Scores outputs
    ├─ Flags quality issues
    └─ Selects best outputs
    ↓
  [4] Synthesizer Agent
    ├─ Combines outputs
    ├─ Creates final deliverable
    └─ Formats for delivery
    ↓
  Order Marked Delivered
    ↓
  Buyer Confirms → Payment Released
  ```
  
  - [ ] Implement in `apps/web/src/lib/queue/orchestrator.ts`
  - [ ] Each agent = separate job type
  - [ ] Store agent outputs in 0G Log for audit trail
  
  **Definition of Done**:
  - ✅ Can queue multi-agent jobs
  - ✅ Jobs execute in correct order
  - ✅ Outputs logged to 0G
  - ✅ Delivery hash generated

---

### 5.2 0G Compute Integration
- [ ] **Task**: Offload inference to 0G Compute
  - [ ] Register with 0G Compute API
  - [ ] Send job requests for each worker
  - [ ] Stream responses back to orchestrator
  - [ ] Implement timeout & retry logic
  
  **Example Job**:
  ```typescript
  const job = {
    model: 'qwen3.6-plus',
    systemPrompt: 'You are a detail-focused code reviewer.',
    userPrompt: 'Review this Solidity code for security issues.',
    maxTokens: 2000,
    temperature: 0.7,
  };
  
  const response = await zerogCompute.execute(job);
  ```
  
  **Definition of Done**:
  - ✅ Jobs execute on 0G Compute
  - ✅ Responses received & parsed
  - ✅ Timeouts handled gracefully

---

### 5.3 Job Queue (BullMQ) Processing
- [ ] **Task**: Configure and process job queue
  - [ ] Verify Redis connection
  - [ ] Start queue processor
  - [ ] Implement job handlers for each agent type
  - [ ] Add retry logic (exponential backoff)
  - [ ] Implement dead-letter queue for failed jobs
  
  **Job Types**:
  ```typescript
  enum JobType {
    DECOMPOSE = 'decompose',
    WORKER_A = 'worker-a',
    WORKER_B = 'worker-b',
    WORKER_C = 'worker-c',
    VALIDATE = 'validate',
    SYNTHESIZE = 'synthesize',
  }
  ```
  
  **Definition of Done**:
  - ✅ Queue processes jobs successfully
  - ✅ Failed jobs retry
  - ✅ Dead-letter queue visible
  - ✅ Job history in 0G Log

---

### 5.4 Reasoning Trace Logging
- [ ] **Task**: Store complete execution trace in 0G Log
  - [ ] Log each agent's input/output
  - [ ] Timestamp every step
  - [ ] Store in append-only log: `STREAMS.orderExecution(orderId)`
  - [ ] Buyer can view full audit trail
  
  **Log Entry Format**:
  ```json
  {
    "timestamp": 1234567890,
    "orderId": "order-123",
    "stage": "decompose",
    "agent": "decomposer.eth",
    "input": "Full task requirements",
    "output": "Breakdown of subtasks",
    "tokensUsed": 1234,
    "durationMs": 5000
  }
  ```
  
  **Definition of Done**:
  - ✅ Complete trace logged
  - ✅ Accessible via API
  - ✅ No sensitive data exposed

---

## ✅ TIER 6: POLISH & LAUNCH

### 6.1 Integration Testing
- [ ] **Task**: End-to-end test of complete flows
  - [ ] Test: Create agent → List gig → Create order → Pay → Execute → Deliver
  - [ ] Test: Cancel order mid-way
  - [ ] Test: Reject delivery & dispute
  - [ ] Test: Multi-agent execution
  - [ ] Test: Payment distribution
  
  **Test Script** (from demo-validation.test.mjs as reference):
  ```bash
  npm run test:integration
  ```
  
  **Definition of Done**:
  - ✅ All happy-path flows tested
  - ✅ All error paths tested
  - ✅ No data loss on errors

---

### 6.2 Error Handling & Rollback
- [ ] **Task**: Implement graceful error handling
  - [ ] Transaction failures → order reverted to previous state
  - [ ] Job failures → retry with exponential backoff
  - [ ] Agent timeouts → fallback to default response
  - [ ] 0G unavailable → use mock data
  - [ ] Clear error messages to users
  
  **Definition of Done**:
  - ✅ No unhandled promise rejections
  - ✅ User sees clear error messages
  - ✅ Data consistent after failures
  - ✅ Logs show root cause

---

### 6.3 Monitoring & Analytics
- [ ] **Task**: Add observability layer
  - [ ] Winston logging for all events
  - [ ] Metrics: order count, payment volume, agent execution time
  - [ ] Dashboard: total gigs, active agents, completion rate
  - [ ] Sentry/error tracking for crashes
  - [ ] 0G Log aggregation for audit trail
  
  **Metrics to Track**:
  ```typescript
  {
    orders_created: number,
    orders_completed: number,
    orders_cancelled: number,
    payment_volume_usdc: string,
    avg_execution_time_ms: number,
    agent_success_rate: number,
    marketplace_active_gigs: number,
    marketplace_active_agents: number,
  }
  ```
  
  **Definition of Done**:
  - ✅ Logs centralized
  - ✅ Can see transaction volume
  - ✅ Can identify bottlenecks

---

### 6.4 Documentation & Runbook
- [ ] **Task**: Create deployment & operations docs
  - [ ] README.md with local setup instructions
  - [ ] DEPLOYMENT.md with devnet steps
  - [ ] RUNBOOK.md for common operations (restart, rollback, etc.)
  - [ ] API.md with endpoint reference
  - [ ] ARCHITECTURE.md with system design
  - [ ] TROUBLESHOOTING.md for common issues
  
  **Definition of Done**:
  - ✅ New developer can set up in <30 min
  - ✅ Operator can deploy confidently
  - ✅ Issue resolution documented

---

### 6.5 Final Testing & Launch
- [ ] **Task**: Final QA before devnet launch
  - [ ] Full UI walkthrough (all pages, all flows)
  - [ ] Stress test: 100 concurrent users
  - [ ] Load test: 10 orders/second
  - [ ] Security audit: no sensitive data logged
  - [ ] Mobile responsive check
  - [ ] Cross-browser testing (Chrome, Firefox, Safari)
  
  **Checklist**:
  - [ ] No console errors on any page
  - [ ] All images load correctly
  - [ ] Forms validate properly
  - [ ] Wallet connection works
  - [ ] Transactions broadcast successfully
  - [ ] ENS names display correctly
  - [ ] Marketplace filters work
  - [ ] Orders can be created & paid
  - [ ] Agents execute jobs
  - [ ] Deliverables can be uploaded
  - [ ] Payments distribute correctly
  - [ ] Reputation updates on completion
  
  **Definition of Done**:
  - ✅ Zero P0 bugs
  - ✅ All team members sign off
  - ✅ Ready for public demo

---

## 📋 Additional Setup & Configuration

### Chain Configuration (Base Sepolia)
```json
{
  "chainId": 84532,
  "rpcUrl": "https://sepolia.base.org",
  "currency": "ETH",
  "testnetFaucet": "https://www.alchemy.com/faucets/base-sepolia",
  "blockExplorer": "https://sepolia.basescan.org"
}
```

### Smart Contract Parameters (Suggested)
```solidity
// HustlMarketplace
uint256 PLATFORM_FEE = 250; // 2.5% fee on every order
uint256 DISPUTE_PERIOD = 7 days; // Time to dispute delivery
uint256 MIN_GIG_PRICE = 10e6; // 10 USDC minimum

// HustlReputation
uint256 SCORE_PER_ORDER = 10;
uint256 RATING_WEIGHT = 50; // Weight of buyer rating in score

// HustlEscrow
address USDC_ADDRESS = 0x...; // Base Sepolia USDC
bool AUTO_RELEASE = false; // Manual release only for MVP
```

### Fee Structure
```
Per Order (1000 USDC example):
├─ Platform Fee (2.5%): 25 USDC → Hustl3 DAO
├─ Coordinator (if Tier 3): 10% → Coordinator Agent
├─ Workers (if Tier 3): 60% → Split among workers
├─ Validator (if Tier 3): 10% → Validation agent
└─ Buyer gets: Deliverable
```

---

## 🎯 Success Criteria for Launch

- [ ] ✅ All 6 tiers completed
- [ ] ✅ 0G Storage + Redis running
- [ ] ✅ Smart contracts deployed to Base Sepolia
- [ ] ✅ All API endpoints functional
- [ ] ✅ Wallet connection working
- [ ] ✅ Can create & pay for gigs
- [ ] ✅ Agents execute multi-step tasks
- [ ] ✅ Payments distribute correctly
- [ ] ✅ Zero P0/P1 bugs
- [ ] ✅ Documentation complete
- [ ] ✅ Team sign-off obtained

---

## 🚀 Deployment Commands (When Ready)

```bash
# 1. Start infrastructure
docker run -p 6789:6789 -p 6790:6790 0glabs/storage-node:latest &
redis-server &

# 2. Deploy contracts
cd packages/contracts
npm run deploy -- --network baseSepolia

# 3. Update env vars
cp .env.local.example .env.local
# Edit with deployed addresses & infrastructure URLs

# 4. Install & build
npm ci
npm run build

# 5. Start dev server
npm run dev

# 6. Access
# Homepage: http://localhost:3000
# API Docs: http://localhost:3000/api-docs (if added)
# Health: http://localhost:3000/api/health
```

---

## 📊 Priority Matrix

| Task | Priority | Duration | Dependencies | Owner |
|------|----------|----------|--------------|-------|
| 0G Storage Setup | P0 | 2h | None | DevOps |
| Redis Setup | P0 | 1h | None | DevOps |
| Environment Config | P0 | 1h | P0 tasks | Backend |
| Contract Compilation | P0 | 1h | None | Contracts |
| Mock Fallbacks | P1 | 2h | P0 tasks | Backend |
| Fix API Endpoints | P1 | 4h | P0 tasks | Backend |
| Contract Deployment | P1 | 2h | Contract comp | Contracts |
| Wallet Connection | P1 | 2h | None | Frontend |
| Payment Integration | P2 | 3h | Contracts deployed | Backend |
| Multi-Agent Exec | P2 | 4h | Queue setup | Backend |
| Integration Tests | P2 | 3h | All APIs | QA |
| Documentation | P3 | 2h | Everything | Tech Lead |

---

## 🎬 Next Steps

1. **You review this checklist** and approve priority order
2. **We tackle TIER 1** (Infrastructure) first - should take ~4-6 hours
3. **Then TIER 2** (API fixes) - ~8 hours
4. **Then TIER 3+** onward

**Ready when you are!** Reply with:
- ✅ If you approve this plan, OR
- 🔄 If you want to adjust priorities, OR  
- ❓ If you need clarification on any items

---

**Status**: 🟡 WAITING FOR YOUR GO-AHEAD  
**Est. Timeline to Launch**: 5-7 days of focused work  
**Team Size Recommended**: 3-4 people (Backend, Frontend, Contracts, DevOps)
