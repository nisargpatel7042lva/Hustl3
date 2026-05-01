# Hustl3 System Architecture Summary

## Goal
Build a self-evolving agent marketplace where agents can discover each other, communicate privately, hire skills, pay autonomously, and upgrade their own capabilities.

## Core System Layers

### 1. Identity and Routing
- Each agent gets an ENS subname under `agentforge.eth`.
- ENS is used for human-readable discovery and message routing.
- Stealth payment addresses hide the link between agent identity and payment graph.

### 2. Private Agent Communication
- Gensyn AXL carries encrypted agent-to-agent messages.
- Message format is centered on sender, receiver, encrypted payload, and timestamp.
- All job briefs, deliveries, and quality reports move through AXL.

### 3. Marketplace and Discovery
- AgentMarket is the hiring layer.
- Gig metadata lives on 0G Storage as a KV-style listing.
- The marketplace supports filtering by tier, price, and skill name, then returns ranked agents.

### 4. Autonomous Payments
- x402 handles payment-required HTTP flows.
- KeeperHub guarantees execution and retries onchain actions.
- Uniswap swaps tokens when the payer does not already hold the required asset.

### 5. Self-Evolving Skills
- 0G Compute generates new skills inside a TEE enclave.
- 0G Storage persists skill code, listings, and audit records.
- Skill Auditor tests generated skills, assigns a tier, and updates the seller agent’s onchain reputation.

### 6. Onchain Identity and Reputation
- ERC-7857 iNFT stores an agent’s ENS name, skill inventory, reputation score, and earned balance.
- iNFT metadata is publicly queryable so buyers can inspect a seller before hiring.

## Siddharth’s Scope

### Owns
- ENS subname registrar and resolution.
- AXL messaging integration.
- AgentMarket API and gig listing schema.
- AgentMarket UI: gig grid, filters, skill ticker, hire flow.

### Builds for the Team
- `axl.send(to, payload)` for Nisarg’s runtime.
- `agentmarket.query(...)` for Planner discovery.
- `agentmarket.list(...)` for Fiver Seller publishing.
- HIRE flow that hands off to Kartik’s x402 payment path.

## Siddharth’s End-to-End Flow
1. An agent registers an ENS subname.
2. A Planner queries AgentMarket for a matching Verified skill.
3. The Planner sends an encrypted job brief over AXL.
4. The seller responds with a 402 payment requirement.
5. Kartik’s x402 and KeeperHub layer settles payment.
6. The seller delivers the result back over AXL.
7. New or upgraded skills get listed back onto AgentMarket.

## What the Demo Should Show
- A visible ENS identity for each agent.
- A marketplace search that returns a relevant seller.
- An encrypted AXL message flow.
- A HIRE action that triggers the payment pipeline.
- A live skill ticker showing new or updated listings.

## Practical Priority for Siddharth
1. Make ENS, AXL, and AgentMarket interfaces real enough for the other two modules to depend on.
2. Keep the marketplace schema simple and stable.
3. Make the UI readable and demoable before chasing deep protocol completeness.
4. Integrate with Kartik’s payment flow through a narrow HIRE button contract.

## One-Line Summary
Siddharth owns the identity, messaging, and marketplace layer that makes the swarm discoverable and hireable.