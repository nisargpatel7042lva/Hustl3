# AgentForge + AgentMarket — Team Division
## Siddharth · Nisarg · Kartik

> 3 people · 3 days · $32,000+ in prizes
> Siddharth and Kartik own smart contracts. All three own full-stack modules.

---

## Prize Ownership

| Prize | Owner | Value |
|---|---|---|
| 0G — Best Agent Framework + Best Autonomous Agents | **Nisarg** | $15,000 |
| KeeperHub + Uniswap + x402 Payment Loop | **Kartik** | $9,500 |
| ENS + Gensyn AXL + AgentMarket Marketplace | **Siddharth** | $7,500 |
| **Total** | | **$32,000+** |

Each person owns their bounty end-to-end — the integration, the code, the README section, and the demo moment for that track.

---

---

# 🔵 Siddharth
### Role: AgentMarket + ENS + AXL Lead
### Bounties: ENS ($2,500) · Gensyn AXL ($5,000) = **$7,500**

Siddharth owns the agent identity layer and the entire peer-to-peer communication backbone. He also builds the AgentMarket — the Fiver-style hiring marketplace that is the centrepiece differentiator of the project.

---

### Smart Contract Work

**ENS Subname Registrar Contract**
- Deploy a custom ENS subdomain registrar under `agentforge.eth`
- Each agent auto-registers a subname on deploy: `planner.agentforge.eth`, `seller-v2.agentforge.eth`, etc.
- Implement ENS stealth address scheme: each payment resolves to a fresh one-time address so the on-chain payment graph cannot be linked to agent identities
- Write the resolver contract that maps ENS names → AXL node addresses for routing

**AgentMarket Index Contract** *(light contract, mostly off-chain storage)*
- On-chain registry that maps `seller ENS name → 0G Storage CID` for their gig metadata
- Emit events when new gigs are listed or updated — the frontend listens to these for the live ticker

---

### Full-Stack Work

**AXL Node Integration (Backend)**
- Set up Gensyn AXL node for encrypted P2P agent messaging
- Build the message envelope format: `{ from: ENS, to: ENS, payload: encrypted(jobBrief), timestamp }`
- All agent-to-agent communication routes through AXL: job briefs from Planner → Seller, deliveries from Seller → Planner, quality reports from Critic → Auditor
- Wire AXL listener into the agent runtime so incoming messages trigger agent actions

**AgentMarket Backend (API layer on 0G Storage)**
- Gig listing schema stored as KV on 0G Storage:
  ```json
  {
    "agent_ens": "summarizer.agentforge.eth",
    "skill_name": "PDF Summarisation",
    "tier": "Verified",
    "price_usdc": 0.02,
    "est_seconds": 8,
    "cid": "0g://abc123"
  }
  ```
- Query endpoint: filter gigs by `tier`, `price_max`, `skill_name` — returns ranked list
- Write endpoint: Fiver Seller agent calls this to list a new skill after Auditor approves it

**AgentMarket Frontend (UI panels)**
- Gig grid: card per skill listing, tier badge (Junior / Verified / Expert), price, agent ENS name, `HIRE VIA X402` button
- Filter bar: tier dropdown, price range slider, ENS search
- Skill evolution ticker: horizontal scrolling feed at the bottom of the page showing newly listed skills in real time (listens to on-chain events from the registry contract)
- Connect the `HIRE` button to Kartik's x402 payment flow

---

### Day-by-Day

| Day | Tasks |
|---|---|
| Day 1 | Deploy ENS registrar contract · Set up AXL node · Define gig listing schema on 0G Storage |
| Day 2 | AXL message routing end-to-end · AgentMarket query + write API · ENS stealth address flow |
| Day 3 | AgentMarket UI (gig grid + filters) · Skill ticker · Wire HIRE button to Kartik's x402 · Demo polish |

---

### Demo Moment (Siddharth presents)
> "Every agent has a human-readable identity. Watch `planner.agentforge.eth` query AgentMarket, find `summarizer.agentforge.eth` at Verified tier for 0.02 USDC, and send it an encrypted job brief over AXL — no central server, no API key, no human in the loop."

---
---

# 🟢 Kartik
### Role: Smart Contracts + x402 Payment Engine + KeeperHub + Uniswap
### Bounties: KeeperHub ($4,500) · Uniswap ($5,000) = **$9,500**

Kartik owns the entire money layer — how agents pay each other, how payments are guaranteed, and how tokens get swapped when assets don't match. He also writes the iNFT smart contract that gives every agent its on-chain identity and skill inventory.

---

### Smart Contract Work

**ERC-7857 iNFT Contract**
- Deploy the iNFT contract: each agent mints one iNFT on creation
- iNFT metadata stores: agent ENS name, skill inventory (list of CIDs pointing to 0G Storage), reputation score (written by Skill Auditor), USDC balance earned from royalties
- `upgradeSkill(cid, tier, score)` function — called by the Auditor after a skill passes review; updates the iNFT metadata on-chain
- `recordEarning(amount)` function — called by KeeperHub after a successful x402 payment; increments the agent's on-chain balance
- Make iNFT metadata publicly queryable so buyers can inspect a seller's reputation before hiring

**x402 Payment Escrow Contract** *(optional but impressive)*
- Lightweight escrow: Planner locks payment on hire, released to Seller on delivery confirmation from Critic
- Adds dispute resolution: if Critic rates output below threshold, escrow refunds the Planner
- This is the "agents earning from agents with quality guarantees" primitive

---

### Full-Stack Work

**x402 Payment Loop (Backend)**
- Implement the full x402 HTTP flow:
  ```js
  const res = await fetch(sellerEndpoint, { method: "POST", body: jobBrief });
  if (res.status === 402) {
    const { amount, token, recipient } = await res.json();
    await keeperHub.execute({ action: "transfer", token, amount, to: recipient, via: "uniswap-api" });
    return fetch(sellerEndpoint, { method: "POST", body: jobBrief }); // retry
  }
  ```
- Every agent endpoint Siddharth builds responds with 402 on unauthenticated calls
- Kartik's payment middleware intercepts, pays, and retries transparently

**KeeperHub MCP Integration**
- Wire all onchain execution through KeeperHub MCP — not direct RPC
- KeeperHub gives: automatic retry on gas failure, full audit trail of every execution, execution guarantee
- Integrate KeeperHub for: x402 payment settlement, iNFT `upgradeSkill` calls, iNFT `recordEarning` calls, escrow lock/release
- Log every KeeperHub execution to the right-panel activity terminal in the UI

**Uniswap API Integration**
- Agents hold USDC by default; if a payment requires a different token, Uniswap API handles the swap before KeeperHub settles
- Wrap the swap logic: `swapIfNeeded(fromToken, toToken, amount)` — called inside the KeeperHub execute block
- For the demo: Executor agent triggers a real Uniswap swap live on stage (small amount, testnet or mainnet)
- Write the `FEEDBACK.md` for Uniswap prize (required for submission)

**Activity Terminal Feed (Frontend)**
- Right-panel terminal UI showing real-time agent actions
- Every KeeperHub execution emits an event → websocket → terminal entry
- Color-coded: x402 payments in teal, iNFT upgrades in amber, swap events in blue, failures in red
- Shows: timestamp · agent ENS · action type · amount · tx hash (clickable)

---

### Day-by-Day

| Day | Tasks |
|---|---|
| Day 1 | Deploy ERC-7857 iNFT contract · Build x402 middleware · KeeperHub MCP setup |
| Day 2 | x402 full loop end-to-end · Uniswap API swap integration · iNFT upgradeSkill + recordEarning wired up |
| Day 3 | Activity terminal UI · Escrow contract (if time) · FEEDBACK.md · Demo polish |

---

### Demo Moment (Kartik presents)
> "The Executor needs to pay for 0G Compute inference. It gets a 402 response — watch KeeperHub guarantee the payment, Uniswap swap the tokens in the same transaction, and the iNFT balance tick up on screen. Every step is on-chain, auditable, and required zero human intervention."

---
---

# 🟠 Nisarg
### Role: 0G Infrastructure + Agent Runtime + Visual Builder + Frontend Lead
### Bounties: 0G Best Agent Framework ($7,500) · 0G Best Autonomous Agents ($7,500) = **$15,000**

Nisarg owns the biggest prize pool and the hardest engineering challenge: the 0G full-stack integration, the self-evolving agent runtime, the skill generation loop, and the entire frontend visual builder and dashboard. He is the glue that makes all of Siddharth's and Kartik's modules feel like one product.

---

### Full-Stack Work

**0G Storage Integration**
- 0G Storage KV: store agent gig listings (Siddharth writes the schema, Nisarg integrates the SDK)
- 0G Storage Log: append-only audit log of all agent actions — immutable record for prize judges
- Client-side encryption before upload: each agent encrypts its memory with its own private key before writing to 0G; only the agent can decrypt
- Expose a simple `storage.get(key)` / `storage.set(key, value)` wrapper used by all agents

**0G Compute (TEE) Integration**
- Connect to 0G Compute's TEE inference endpoint (`qwen3.6-plus` or equivalent)
- All skill generation prompts go through TEE — even 0G nodes cannot see the input/output
- Write the skill generation prompt: given a `skill_gap` description, generate a TypeScript function that solves it, with tests
- Wrap in retry logic: if generated code fails tests, regenerate up to 3 times

**Self-Evolving Agent Runtime**
- Core agent loop: `receive_goal → plan → execute → critique → evolve`
- Critic agent integration: after every task, Critic scores the output; if score < threshold, it emits a `skill_gap` event
- Skill Auditor agent: receives generated skill code, runs it against a test suite, assigns Junior/Verified/Expert tier, calls Kartik's `upgradeSkill` on the iNFT
- Fiver Seller agent runtime: on skill approval, automatically calls Siddharth's AgentMarket write API to list the new gig
- Planner agent runtime: on task start, queries AgentMarket, picks best-value Verified agent, sends job brief via Siddharth's AXL layer

**Visual Agent Builder (Frontend — Canvas)**
- Drag-and-drop canvas: each agent archetype is a card the user drags onto the canvas
- Connect agents with edges to define the communication topology (Planner → Researcher, Planner → AgentMarket, etc.)
- One-click Deploy: reads the canvas graph, spins up the agent runtime, registers ENS names, mints iNFTs
- Agent cards show live status: idle / working / waiting for payment / skill generated

**Swarm Dashboard (Frontend — Centre Panel)**
- Live swarm monitor: shows all 6 agents with their current task, ENS name, iNFT skill count, and USDC balance
- Agent heartbeat dot: pulses teal when active, amber when waiting on payment, gray when idle
- Task timeline: shows what each agent is doing right now and what it completed

---

### Day-by-Day

| Day | Tasks |
|---|---|
| Day 1 | 0G Storage SDK wrapper · 0G Compute TEE inference integration · Self-skill-generation loop (Critic → generate → test → store) |
| Day 2 | Full agent runtime (Planner, Researcher, Executor, Critic, Fiver Seller, Skill Auditor loops) · Wire in Siddharth's AXL + Kartik's x402 calls · One-click Deploy |
| Day 3 | Visual agent builder UI (canvas) · Swarm dashboard · Assemble all three panels into the final UI · Demo video · README architecture diagram |

---

### Demo Moment (Nisarg presents)
> "Watch me drag six agents onto the canvas and click Deploy. In 10 seconds, each one has an ENS name, a minted iNFT, and is live on 0G Compute. The Planner receives a research goal — the swarm self-organises, the Critic spots a missing skill, and 0G Compute generates it inside a hardware enclave. The new skill lists itself on AgentMarket. The framework just evolved itself."

---

---

## Integration Contracts Between Team Members

These are the exact interfaces each person builds so the others can depend on them without blocking.

| Interface | Owner | Consumer |
|---|---|---|
| `axl.send(to: ENS, payload: encrypted)` | Siddharth | Nisarg (agent runtime) |
| `agentmarket.query(tier, price_max)` → gig list | Siddharth | Nisarg (Planner agent) |
| `agentmarket.list(gigSchema)` | Siddharth | Nisarg (Fiver Seller agent) |
| `x402.pay(endpoint, jobBrief)` → response | Kartik | Nisarg (agent runtime), Siddharth (HIRE button) |
| `keeperhub.execute(action, params)` | Kartik | Nisarg (iNFT upgrades) |
| `inft.upgradeSkill(cid, tier, score)` | Kartik | Nisarg (Skill Auditor) |
| `storage.get(key)` / `storage.set(key, val)` | Nisarg | Siddharth (gig listings), Kartik (skill CIDs) |
| `agent.onMessage(handler)` | Nisarg | Siddharth (AXL listener wires in here) |

Define all interfaces on Day 1 morning. Build in parallel from Day 1 afternoon. Integrate on Day 2 evening.

---

## 3-Day Sync Schedule

| Time | Sync |
|---|---|
| Day 1 · 9am | Kickoff — agree on all interfaces above, assign ENS domain, deploy contracts to testnet |
| Day 1 · 9pm | Check-in — 0G Storage + Compute working, AXL node live, iNFT mintable |
| Day 2 · 9pm | Integration night — wire all three modules together, full loop working end-to-end |
| Day 3 · 2pm | Demo rehearsal — full 3-minute script, catch any broken flows |
| Day 3 · 6pm | Freeze — no new features, only bug fixes and README |

---

## Summary

| Person | Core Domain | Prize Target | Day 3 Demo Line |
|---|---|---|---|
| **Siddharth** | ENS identities · AXL comms · AgentMarket UI | $7,500 | "Every agent has a name. Every message is encrypted." |
| **Kartik** | x402 payments · KeeperHub · Uniswap · iNFT contracts | $9,500 | "Agents pay each other. On-chain. Autonomously." |
| **Nisarg** | 0G infra · Agent runtime · Visual builder · Dashboard | $15,000 | "The framework just evolved itself. Live." |