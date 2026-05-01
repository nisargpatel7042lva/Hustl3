# Siddharth Work Checklist

## 1. Understand the current repo surfaces
- [ ] Review the main app entry at [src/app/page.tsx](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/page.tsx)
- [ ] Review the marketplace page at [src/app/agents/page.tsx](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/agents/page.tsx)
- [ ] Review the explorer page at [src/app/explore/page.tsx](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/explore/page.tsx)
- [ ] Review the swarm dashboard at [src/app/swarm/page.tsx](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/swarm/page.tsx)
- [ ] Review the agent builder at [src/app/agent-builder/page.tsx](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/agent-builder/page.tsx)
- [ ] Review the wallet hook at [src/lib/hooks/useWallet.ts](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/lib/hooks/useWallet.ts)
- [ ] Review the agent runtime at [src/lib/agents/AgentRuntime.ts](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/lib/agents/AgentRuntime.ts)
- [ ] Review the order API routes at [src/app/api/orders/create/route.ts](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/api/orders/create/route.ts) and [src/app/api/orders/[id]/route.ts](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/app/api/orders/[id]/route.ts)
- [ ] Review shared marketplace data in [src/lib/constants.ts](/Users/siddharthpanchal/EthGlobal/openAgents/Hustl3/src/lib/constants.ts)

## 2. Clarify Siddharth ownership
- [ ] ENS subname registration and resolution
- [ ] AXL message format and listener integration
- [ ] AgentMarket gig listing schema
- [ ] AgentMarket query endpoint
- [ ] AgentMarket write endpoint
- [ ] Marketplace UI: gig grid, filters, ENS search, skill ticker
- [ ] HIRE button handoff to Kartik's x402 flow

## 3. Check shared integration points
- [ ] Confirm `axl.send(to, payload)` shape for Nisarg's runtime
- [ ] Confirm `agentmarket.query(tier, price_max, skill_name)` return format
- [ ] Confirm `agentmarket.list(gigSchema)` input format
- [ ] Confirm the 402 response contract for hiring
- [ ] Confirm what fields are needed from ENS for display and routing

## 4. Map current implementation vs. target
- [ ] Identify which pages are mock UI only
- [ ] Identify which APIs are already real and which are placeholders
- [ ] Identify which data should move to 0G Storage later
- [ ] Identify where AXL listener hooks into the agent runtime
- [ ] Identify where the marketplace UI should consume live data instead of static lists

## 5. Build order for Siddharth
- [x] Freeze the API contract for AgentMarket
- [x] Define the gig schema and filter shape
- [x] Build ENS display and lookup flow
- [x] Wire AXL send/receive stubs
- [x] Replace marketplace mock data with the shared contract
- [x] Connect HIRE to the payment pipeline
- [x] Add the live skill ticker behavior

## 6. Demo readiness checklist
- [ ] Show a real ENS name on screen
- [ ] Show a filtered marketplace result
- [ ] Show encrypted message flow over AXL
- [ ] Show a HIRE action that triggers payment handoff
- [ ] Show a new or updated gig appearing in the ticker

## 7. Notes for later
- [ ] Keep the scope narrow until the interfaces are stable
- [ ] Prefer simple, testable mocks over speculative protocol depth
- [ ] Keep all shared contracts readable by the other two teammates