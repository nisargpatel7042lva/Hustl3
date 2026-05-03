# Multichain Contract Deployment Checklist

Purpose: ordered, actionable checklist to deploy Hustl3 contracts across testnets and mainnets. I will only proceed when you approve each step; after completing a step I'll ask for confirmation to move forward.

1. Review & approve checklist
   - Action: You read this file and reply `approve` to begin.

2. Run tests & quick audit
   - Command:
     ```bash
     cd packages/contracts
     npm ci
     npm run test
     ```
   - Purpose: catch failures before deploying.

3. Configure environment variables (locally and CI)
   - Required keys (add to `.env.local`):
     - `PRIVATE_KEY` (deployer)
     - `BASE_SEPOLIA_RPC` or `BASE_RPC_URL`
     - `ZEROG_RPC_URL`
     - `BASESCAN_API_KEY` (for verification)
     - `KEEPERHUB_API_KEY` (for KeeperHub integration)
     - `ZEROG_*` keys for compute/storage if needed

4. Verify Hardhat networks
   - File: `packages/contracts/hardhat.config.ts`
   - Ensure RPC URLs and `PRIVATE_KEY` are read from env and network names include `baseSepolia` and `zeroG`.

5. Compile & build contracts
   - Command:
     ```bash
     cd packages/contracts
     npm run compile
     ```

6. Local fork smoke tests
   - Action: run targeted tests against a forked mainnet/base state to validate integration points (e.g., ENS, token allowances).
   - Tooling: Hardhat network forking.

7. Deploy to Base Sepolia (testnet)
   - Command (example):
     ```bash
     cd packages/contracts
     npm run deploy -- --network baseSepolia
     ```
   - Save addresses and tx hashes.

8. Deploy to 0G testnet
   - Command (example):
     ```bash
     cd packages/contracts
     npm run deploy -- --network zeroG
     ```

9. Verify contracts on explorers
   - Use `BASESCAN_API_KEY` (or respective explorer API) and `hardhat-verify` plugin.

10. Post-deploy integration tests
    - Exercise: create order → fund escrow → markDelivered → releaseEscrow flows using deployed addresses.

11. Create multisig & transfer ownership
    - Create multisig (Gnosis/third-party) and transfer `owner()` where appropriate.

12. Update frontend env & addresses
    - Set `NEXT_PUBLIC_ESCROW_ADDRESS`, `NEXT_PUBLIC_MARKETPLACE_ADDRESS`, etc., in `apps/web/.env.local` or deployment config.

13. Setup KeeperHub authorizations
    - Authorize backend addresses in `HustlEscrow` using `setAuthorizedBackend` (owner-only).

14. Record addresses & release notes
    - Prepare a single file with deployed addresses, tx hashes, verification links, and short notes.

15. Promote to mainnet (final)
    - Repeat deploy+verify on mainnet only after audits, multisig checks and budget approvals.

Notes
- I will perform the actions only after you explicitly approve each step. Reply `approve` to start step 2 (run tests & audit).
- If you want me to open PRs for changed env files or add CI workflow skeletons, say so and I will add them as separate tasks.
