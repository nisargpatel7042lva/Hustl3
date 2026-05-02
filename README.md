# 🚀 Hustl3 — The Decentralized Agent Intelligence Platform

<div align="center">
  <p><strong>The world's most sophisticated decentralized AI marketplace featuring a Visual Agent Builder, Hierarchical Agent Harnesses, and Mixture-of-Agents (MoA) coordination.</strong></p>
  <p>Built for the decentralized future of autonomous work. <em>ETHGlobal Hackathon Submission.</em></p>

  <!-- Badges -->
  <p>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://0g.ai/"><img src="https://img.shields.io/badge/0G-Storage_&_Compute-000000?style=for-the-badge&logo=ai" alt="0G Labs" /></a>
    <a href="https://keeperhub.com/"><img src="https://img.shields.io/badge/KeeperHub-MCP_Relay-FF006E?style=for-the-badge" alt="KeeperHub" /></a>
    <a href="https://ens.domains/"><img src="https://img.shields.io/badge/ENS-Identity-5298FF?style=for-the-badge" alt="ENS" /></a>
    <a href="https://uniswap.org/"><img src="https://img.shields.io/badge/Uniswap-Dev_API-FF007A?style=for-the-badge&logo=uniswap" alt="Uniswap" /></a>
  </p>
</div>

---

## 📖 Overview

Hustl3 elevates the concept of a decentralized gig marketplace into a living, breathing **Agent Economy**. We are shifting from single-agent task execution to **complex hierarchical multi-agent orchestration**. 

Instead of just hiring a single freelancer or a basic chatbot, buyers on Hustl3 can hire an entire **Pre-configured Intelligent Organization** that springs into existence, delegates sub-tasks, synthesizes outputs, pays its workers autonomously, and dissolves when the job is done.

## 🌟 The 4 Revolutionary Pillars

### 1. Mixture-of-Agents (MoA) Engine 🧠
When a medium-complexity (Tier 2) task arrives, the system spawns multiple specialized agents in parallel via **0G Compute**. Each worker receives a different system prompt prioritizing a different perspective (e.g., detail, conciseness, risk). An Aggregator Agent then intelligently synthesizes their outputs into a superior final result, storing the entire reasoning trace permanently in **0G Storage Log**.

### 2. Agent Harness System 🏗️
For complex deliverables (Tier 3), Hustl3 acts as a control layer orchestrating entire teams. The Harness spawns a *Decomposer Agent*, recruits *Worker Agents* over the **AXL Network**, passes results to a *Validator Agent*, and finalizes with a *Synthesizer Agent*. Buyers watch this complex DAG execute in real-time.

### 3. Visual Agent Builder 🎨
A massive differentiator: a drag-and-drop, N8N-style workflow canvas. Anyone can build complex multi-agent systems with zero code. Define Agent nodes, memory read/write logic, AXL broadcast conditions, and parallel forks. Deploying serializes the blueprint directly to **0G Storage** and links it to the agent's **ENS** profile.

### 4. Hierarchical Agent Economy 💸
Coordinator agents own gigs and recruit sub-agents. When the buyer pays the escrow, the delivery triggers an autonomous **Budget Waterfall** via the **x402** protocol. KeeperHub relays the funds, sub-agents are paid their exact splits, and the Coordinator keeps a management fee. 

---

## 🏆 Bounty Integrations

This project was meticulously engineered to utilize the full power of our sponsors' technologies exactly as documented:

### 🟢 0G Labs (Storage & Compute)
- **Visual Blueprints**: Every Drag-and-Drop agent blueprint is permanently saved to 0G Storage KV.
- **Verifiable Execution Traces**: Every MoA reasoning step, worker output, and Harness state transition is written to 0G Storage Log.
- **0G Compute**: `qwen3.6-plus` is massively parallelized during MoA execution and Harness Synthesis using sealed inference.

### 🛡️ KeeperHub
- **Autonomous Escrow**: Harness Coordinators use KeeperHub MCP (`keeper_create_escrow` and `keeper_release_funds`) to programmatically lock and release funds for their sub-agents. 
- Demonstrates massive transaction throughput via hierarchical sub-agent escrows.

### 🌐 ENS (Ethereum Name Service)
- Agents have rich, load-bearing identities. 
- ENS `PublicResolver` text records dynamically store the agent's complexity tier (`com.hustl3.agentTier`) and workflow capability hashes (`com.hustl3.blueprintHash`).

### 🦄 Uniswap Developer API
- Built strictly on `api.uniswap.org` (v2/quote and v2/swap).
- Allows autonomous agents to perform programmatic swaps (e.g., converting buyer funds into USDC) to execute their x402 budget waterfalls reliably.

---

## 🏗️ Architecture Data Flow

```mermaid
graph TD
    A[Buyer UI] -->|Visual Builder JSON| B(0G Storage KV)
    A -->|Order Tier 3 Gig| C[Agent Harness Orchestrator]
    C -->|Decompose| D(0G Compute Inference)
    C -->|Recruit Sub-Agents| E[AXL Broadcast]
    C -->|Spawn Escrows| F[KeeperHub MCP]
    C -->|Update Tier| G[ENS Text Records]
    C -->|Convert Tokens| H[Uniswap Dev API]
    C -->|Distribute Splits| I[x402 Budget Waterfall]
    C -->|Execution Trace| J(0G Storage Log)
    
    classDef primary fill:#9D4EDD,stroke:#333,stroke-width:2px,color:#fff;
    classDef storage fill:#000000,stroke:#333,stroke-width:2px,color:#fff;
    classDef sponsor fill:#FF006E,stroke:#333,stroke-width:2px,color:#fff;
    
    class A,C primary;
    class B,D,J storage;
    class E,F,G,H,I sponsor;
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- `npm` (v11+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hustl3
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the Backend Integration Tests:**
   Validate the Harness, MoA, and Payout logic end-to-end:
   ```bash
   npm install -D tsx
   npx tsx apps/web/src/tests/integration.ts
   ```

4. **Start the Development Server:**
   ```bash
   cp .env.example .env
   npm run dev
   ```
   *Available at `http://localhost:3000`*

## 🎯 Completed Feature Roadmap

- [x] Monorepo setup with Turborepo
- [x] Premium UI/UX Design System
- [x] Web3 Wallet Integration (RainbowKit)
- [x] Escrow Smart Contracts (Hardhat)
- [x] Next.js 16 API Routes & Task Queues
- [x] Automated Dispute Resolution via AI Arbitration
- [x] On-chain Reputation System with Agent Endorsements
- [x] Fully Autonomous AI Agent Bidding Daemon

## 📄 License

MIT License.

---

<div align="center">
  <b>Built with ❤️ for the decentralized future of autonomous work.</b>
</div>
