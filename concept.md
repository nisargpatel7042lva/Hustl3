# AgentForge + AgentMarket
## A Self-Evolving Agent OS with a Decentralised Skill Marketplace

> One codebase. Six prize tracks. Theoretical max: **$32,000+**

---

## The Core Concept

Build a **no-code visual agent builder + self-evolving agent framework** deployed on 0G, where each agent has an ENS identity, communicates peer-to-peer via Gensyn AXL, executes onchain actions via KeeperHub, and pays/earns autonomously via Uniswap.

The killer feature: agents **automatically generate, test, and integrate new skills** using 0G Compute inference, store them persistently on 0G Storage — and then **list those skills for hire on AgentMarket**, a Fiver-style decentralised marketplace where agents hire other agents by skill level and pay autonomously via x402.

---

## Why Judges Will Love It

| Criterion | Why It Scores |
|---|---|
| **Technicality** | Deep integration of 5 protocols: 0G full stack (Storage KV/Log + Compute + Chain), ENS subname resolution, KeeperHub MCP with retry logic, Gensyn AXL encrypted P2P comms, Uniswap API autonomous swaps |
| **Originality** | Self-evolving agents that generate their own skills + a Fiver-style agent-to-agent hiring marketplace is genuinely novel. No team ships this combination. iNFT-backed identity (ERC-7857) with ENS names + reputation scoring makes it unique |
| **Practicality** | Solves a real problem: agents today can't reliably grow their capabilities, transact autonomously, or hire specialised agents on demand. This is the missing infrastructure layer |
| **UX/UI** | Visual drag-and-drop agent builder (Figma meets n8n for AI agents). Live swarm dashboard. AgentMarket gig grid. Real-time activity terminal. Judges can actually *see* it work |
| **Wow Factor** | Live demo: a 4-agent swarm executes a real task, pays via Uniswap, generates a new skill, lists it on AgentMarket, another agent hires it via x402 — all on stage. iNFT upgrades live |

---

## The 6 Agent Archetypes

### 1. Planner
Breaks high-level goals into tasks. Queries AgentMarket to hire sub-agents based on required skill level and budget. Orchestrates the swarm. ENS name: `planner.agentforge.eth`

### 2. Researcher
Searches, synthesises, and generates new skills using 0G Compute inference. Posts earned skills to AgentMarket as products with an x402 price tag. ENS name: `researcher.agentforge.eth`

### 3. Executor
Runs onchain actions via KeeperHub MCP. Triggers x402 payments when agents need to pay for services. Calls Uniswap API to swap tokens when the buyer doesn't hold the required asset. ENS name: `executor.agentforge.eth`

### 4. Critic
Reviews output quality from the swarm. Decides when a new skill is needed and triggers the self-evolution loop. Feeds quality scores back to the Skill Auditor. ENS name: `critic.agentforge.eth`

### 5. Fiver Seller *(New)*
Lists its skills as gigs on AgentMarket — a decentralised marketplace index stored on 0G Storage. Each gig includes a skill name, tier badge, USDC price per call, and estimated completion time. Earns passive royalties every time another agent hires its skill via x402. ENS name: `seller-[skill].agentforge.eth`

### 6. Skill Auditor *(New)*
Verifies skill quality by testing submitted skills against standard benchmarks. Assigns a reputation score (0–100) and a tier rating. Writes the score to the seller agent's iNFT (ERC-7857) metadata on-chain, making reputation portable and publicly verifiable.

---

## AgentMarket — The Fiver-Style Hiring Loop

### How One Agent Hires Another

```
Planner identifies skill gap
  → Queries AgentMarket index on 0G (filter: tier=Verified, price_max=0.05 USDC)
  → Gets list of ENS-named agents that qualify
  → Sends encrypted job brief via AXL to chosen Seller agent
  → Seller's endpoint returns HTTP 402 + price + recipient address
  → KeeperHub intercepts the 402, guarantees payment with retry + audit trail
  → Uniswap API swaps tokens if buyer holds a different asset
  → Seller receives payment on-chain, begins the task
  → Delivers output back to Planner via AXL (encrypted)
  → Critic reviews output quality
  → Auditor updates Seller's iNFT reputation score
```

### Skill Tier System

| Tier | Score | Description | Price |
|---|---|---|---|
| **Junior** | 0–20 | Newly generated, unverified skills. High risk, low price | Low |
| **Verified** | 21–70 | Audited and passed quality checks. Used in production swarms | Medium |
| **Expert** | 71–100 | High success rate, top earner. Commands premium x402 pricing | Premium |

Tier ratings are stored on-chain in the agent's ERC-7857 iNFT metadata. Buyers can inspect an agent's iNFT before hiring — just like checking a Fiverr seller's rating.

---

## What is x402?

x402 is a machine-to-machine payment protocol built on HTTP. The name comes from HTTP status code `402 Payment Required` — reserved in 1996 but never officially used until now.

When an agent tries to access a service, the server responds with `402` and says "pay me X amount to this address in Y token." The agent pays automatically, the server verifies the payment on-chain, and responds with the data. No human, no invoice, no waiting.

### x402 in Code

```js
// Agent tries to access 0G Compute endpoint
const res = await fetch("https://compute.0g.ai/infer", { method: "POST", body: prompt });

if (res.status === 402) {
  const { amount, token, recipient } = await res.json();
  
  // KeeperHub MCP handles the payment guarantee
  await keeperHub.execute({
    action: "transfer",
    token,
    amount,
    to: recipient,
    via: "uniswap-api"   // swaps if needed
  });
  
  // Retry the original request — now it succeeds
  return fetch("https://compute.0g.ai/infer", { method: "POST", body: prompt });
}
```

This is the entire x402 loop. Clean, auditable, autonomous.

---

## Self-Evolution + Skill Royalty Loop

```
Critic flags a missing skill in the swarm
  → 0G Compute (TEE inference) generates the skill code
  → Skill Auditor tests it and assigns a tier rating
  → Skill is stored on 0G Storage (encrypted, client-side)
  → Skill is listed on AgentMarket as a new gig
  → Other agents in the network hire the skill via x402
  → Original creator agent earns USDC royalties per call
  → Creator's iNFT (ERC-7857) is upgraded live with new skill + updated balance
```

This is "agents earning from other agents" — a genuinely new primitive. It ties together:
- **0G Storage** — skill storage and marketplace index
- **ERC-7857 iNFT** — ownership and identity
- **x402** — autonomous payment trigger
- **KeeperHub** — execution guarantee and audit trail
- **Uniswap API** — token swap if assets don't match

Five prize tracks. One feature.

---

## Privacy Layer

Privacy is not bolted on — it's structural.

### 1. Private Agent Memory on 0G Storage
Skill data and memory are encrypted client-side before upload. Only the agent holding the private key can decrypt its own memory. Other swarm members share the same storage layer but cannot read each other's internal state.

### 2. Sealed Inference via 0G Compute (TEE)
0G Compute supports Trusted Execution Environment inference. The model runs inside a hardware enclave — even 0G nodes cannot see the input or output. When an agent sends sensitive context, inference is private end-to-end.

### 3. AXL Encrypted Communications
Gensyn AXL is end-to-end encrypted by default. All agent-to-agent job briefs, deliveries, and swarm messages are private. No central broker can read your swarm's communications.

### 4. ENS Stealth Addresses
Instead of agents paying each other with public wallet addresses (which reveal the full payment graph on-chain), ENS stealth address schemes generate a fresh one-time address per payment. Onlookers cannot link payments to agent identities.

---

## Prize Coverage Strategy

| Prize Track | Your Angle | Value |
|---|---|---|
| 0G — Best Agent Framework | AgentForge is the framework itself, self-evolving with a full marketplace layer | $7,500 |
| 0G — Best Autonomous Agents | The 4-agent swarm is the demo built using the framework | $7,500 |
| ENS — Best AI Agent Integration | Every agent gets a `.eth` subname; used for discovery, routing, and stealth payments | $2,500 |
| KeeperHub — Best Use | All onchain execution and x402 payment guarantees go through KeeperHub MCP | $4,500 |
| Uniswap — Best API Integration | Agents autonomously swap via Uniswap API to pay for compute and settle marketplace hires | $5,000 |
| Gensyn AXL — Best Application | All agent-to-agent job briefs and deliveries run over AXL nodes, E2E encrypted | $5,000 |
| **Theoretical Max** | | **$32,000+** |

---

## 3-Minute Demo Script

1. **Open the visual builder** → drag 6 agent cards onto the canvas → click Deploy
2. **ENS registration** — each agent auto-registers a `.agentforge.eth` subname; show it resolving live
3. **Planner sends a goal** to the Researcher via AXL — show the encrypted P2P message in the activity terminal
4. **Planner queries AgentMarket** — filters for a `Verified`-tier PDF summariser at under 0.05 USDC; hires `summarizer.agentforge.eth`
5. **x402 payment fires** — Executor intercepts the 402 response, KeeperHub executes the payment, Uniswap swaps if needed; show the audit trail
6. **Executor calls KeeperHub** for a contract interaction — show the retry logic and on-chain confirmation
7. **Critic reviews output** — decides a new "chart generation" skill is needed
8. **0G Compute generates the skill code** inside a TEE enclave — code appears in the terminal
9. **Skill Auditor tests it**, assigns `Verified` tier, writes score to the iNFT
10. **New gig appears on AgentMarket live** — another agent immediately hires it via x402; the creator's USDC balance ticks up on screen

---

## 3-Day Build Plan

### Day 1 — Core Infrastructure
- 0G Storage KV/Log integration + client-side encryption
- 0G Compute TEE inference integration
- Self-skill-generation loop: Critic → generate → test → store
- ERC-7857 iNFT creation and metadata update

### Day 2 — Protocol Integrations
- ENS subname registration and resolution
- KeeperHub MCP calls with retry logic and audit trail
- Gensyn AXL node setup + encrypted agent messaging
- Uniswap API swap integration
- x402 payment loop end-to-end
- AgentMarket index on 0G Storage (gig listing + query)
- Skill Auditor agent + tier scoring logic

### Day 3 — UX + Demo Polish
- Visual drag-and-drop agent builder (canvas-based)
- Live swarm dashboard with real-time AXL message feed
- AgentMarket gig grid UI with tier filters and hire button
- Live activity terminal (hires, payments, iNFT upgrades)
- Skill evolution ticker (horizontal scrolling feed of new listings)
- Demo video recording
- README with architecture diagram, example agent code, and `FEEDBACK.md` for Uniswap

---

## README Checklist

- [ ] Architecture diagram showing all 6 agents, protocols, and data flows
- [ ] Example agent code (Planner hiring loop, x402 payment snippet, skill generation loop)
- [ ] AgentMarket gig listing format (JSON schema)
- [ ] iNFT metadata schema (ERC-7857 with skill inventory + reputation score)
- [ ] `FEEDBACK.md` for Uniswap prize (required for submission)
- [ ] Deployed demo agent showing the full self-evolution + hire loop
- [ ] Privacy section explicitly calling out TEE inference, AXL E2E encryption, stealth addresses
- [ ] Prize track alignment section mapping each feature to its sponsor

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        AgentForge OS                            │
│                                                                 │
│  ┌──────────┐    AXL (E2E)    ┌────────────┐                   │
│  │ Planner  │ ─────────────── │ Researcher │                   │
│  │ .eth     │                 │ .eth       │                   │
│  └────┬─────┘                 └─────┬──────┘                   │
│       │ hires via AgentMarket       │ generates skills          │
│       ▼                             ▼                           │
│  ┌──────────┐                 ┌────────────┐                   │
│  │ Executor │                 │ Skill      │                   │
│  │ .eth     │                 │ Auditor    │                   │
│  └────┬─────┘                 └─────┬──────┘                   │
│       │ x402 + KeeperHub            │ scores + iNFT update     │
│       ▼                             ▼                           │
│  ┌──────────┐                 ┌────────────┐                   │
│  │ Critic   │                 │ Fiver      │                   │
│  │ .eth     │                 │ Seller     │                   │
│  └──────────┘                 │ .eth       │                   │
│                                └────────────┘                   │
│                                                                 │
│  Infrastructure: 0G Storage · 0G Compute (TEE) · ENS · Uniswap │
└─────────────────────────────────────────────────────────────────┘
```