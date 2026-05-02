# Integration Feedback: KeeperHub & Uniswap

As part of integrating KeeperHub MCP and the Uniswap Developer API for the Hustl3 decentralized AI agent marketplace, we encountered Several areas of friction, documentation gaps, and general DX improvements that could be made. 

This feedback is submitted to fulfill the mandatory feedback bounties and reflects genuine integration experience.

---

## KeeperHub Feedback

### What Worked Well
- **MCP Tool Schema Design:** The JSON-RPC tool schemas for the AI agent integrations were extremely well thought out. Binding the LLM directly to `keeper_create_escrow` and `keeper_release_funds` worked seamlessly out of the box with the Anthropic and OpenAI tool-calling APIs.
- **Speed of Webhooks:** The callback webhooks upon job completion are incredibly fast, making the state-machine transitions in our Agent Harness orchestrator very responsive.

### Bugs Encountered
1. **Nonce Collision in High-Volume Escrows**
   - **Reproduction Steps:** During a Tier 3 Agent Harness execution, a coordinator agent recruits 4 sub-agents and attempts to spawn 4 parallel sub-escrow creations via the MCP server concurrently.
   - **Expected Behavior:** KeeperHub should queue the intents and manage the nonce for the coordinator's wallet.
   - **Actual Behavior:** 3 out of 4 requests failed with a `Replacement transaction underpriced` or `Nonce too low` error. 
   - **Workaround:** We had to implement an artificial delay (mutex lock) on our end when calling the KeeperHub MCP server for parallel sub-agents. 

### Documentation Gaps & UX Friction
- **Missing Clear Examples for Webhook Validation:** The docs state that webhooks are signed, but do not provide a clear Node.js snippet for verifying the `X-KeeperHub-Signature`. We had to guess the HMAC-SHA256 implementation details.
- **Testnet Faucet Integration:** When testing on Sepolia, the KeeperHub dashboard has no internal way to request testnet tokens for the relayer, forcing us to go hunt for external Alchemy/Infura faucets to fund the gas tanks.

### Feature Requests
- **Batch Intents:** Please add a `keeper_batch_execute` tool to the MCP server. When our agent harness needs to pay 5 sub-agents at once via x402, sending 5 separate intents is slow and gas-inefficient.

---

## Uniswap API Feedback

### What Worked Well
- **Quote Endpoint Reliability:** The `https://api.uniswap.org/v2/quote` endpoint is incredibly fast and the `route` array returned is very easy to parse for our aggregator agent.
- **Token List Consistency:** The automatic token resolution via standard symbols (like USDC/WETH) saved a lot of time versus hardcoding contract addresses for Sepolia.

### Bugs Encountered
1. **Slippage Tolerance Type Coercion**
   - **Reproduction Steps:** Submit a quote request with `"slippageTolerance": "0.5"`.
   - **Expected Behavior:** API accepts the string or clearly rejects with a type error.
   - **Actual Behavior:** The API returns a cryptic 500 Internal Server Error. 
   - **Fix:** It expects a strict float `0.5`, but the documentation payload example showed it as a string in one of the cURL examples. This caused an hour of debugging.

### Documentation Gaps & UX Friction
- **Constructing the Transaction Object:** The documentation stops abruptly after showing how to get the quote. The jump from "Here is your quote response" to "Here is the exact `ethers.js` transaction object you need to sign" is completely missing. We had to reverse-engineer the `methodParameters` (calldata, value, to) to build the un-signed transaction for our KeeperHub relayer.
- **Gas Estimation Accuracy:** The `gasUseEstimate` returned by the quote endpoint is frequently 20-30% lower than the actual execution cost on Sepolia, causing our autonomous agent transactions to revert with `Out of Gas` if we don't manually pad the limit.

### Feature Requests
- **Permit2 Native Examples:** It would be incredibly helpful if the API docs included a native tutorial on how to combine Permit2 approvals with the swap execution in a single multicall payload for agent wallets that don't want to submit two separate transactions.
