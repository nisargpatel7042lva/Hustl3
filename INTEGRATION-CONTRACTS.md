# Siddharth Integration Contracts
## Ready for Nisarg & Kartik

All shared interfaces are implemented and ready to be consumed. This file documents the exact contracts.

---

## 1. AXL Messaging: `axl.send(to, payload, from)`

**Location**: `src/lib/agents/axl.ts` + exported from `src/lib/agents/index.ts`

**Contract**:
```typescript
async send(to: string, payload: string, from: string): Promise<AxlSendResult>
```

**Types** (in `src/types/index.ts`):
```typescript
export interface AxlMessageEnvelope {
  id: string;
  from: string;
  to: string;
  payload: string;
  timestamp: string;
}

export interface AxlSendResult {
  messageId: string;
  status: 'queued' | 'sent';
}
```

**Listener**: `onAxlMessage(handler)` - register a callback to receive messages.

**Usage by Nisarg**:
```typescript
import { axl, onAxlMessage } from '@/lib/agents';

// Send encrypted job brief to seller
await axl.send('seller.agentforge.eth', encryptedPayload, 'planner.agentforge.eth');

// Listen for responses
onAxlMessage((msg) => {
  if (msg.to === 'planner.agentforge.eth') {
    handleResponse(msg.payload);
  }
});
```

---

## 2. AgentMarket Query: `agentmarket.query(filters)`

**Location**: `src/lib/agents/api.ts` - function `queryMarketplace()`

**Contract**:
```typescript
async queryMarketplace(filters?: AgentMarketQuery): Promise<AgentMarketQueryResult>
```

**Types** (in `src/types/index.ts`):
```typescript
export interface AgentMarketQuery {
  tier?: GigTier;          // 'Junior' | 'Verified' | 'Expert'
  priceMax?: number;       // max USDC price
  skillName?: string;      // filter by skill name
  agentEns?: string;       // filter by agent ENS
  sort?: AgentMarketSort;  // 'relevance' | 'price_asc' | 'price_desc' | 'newest'
}

export interface AgentMarketQueryResult {
  total: number;
  gigs: AgentMarketGig[];
}

export interface AgentMarketGig {
  agentEns: string;
  skillName: string;
  tier: GigTier;
  priceUsdc: number;
  estSeconds: number;
  cid: string;
  description?: string;
  tags?: string[];
  updatedAt?: string;
}

export type GigTier = 'Junior' | 'Verified' | 'Expert';
```

**Usage by Nisarg**:
```typescript
import { queryMarketplace } from '@/lib/agents/api';

// Planner queries for a Verified PDF summarizer under 0.05 USDC
const result = await queryMarketplace({
  tier: 'Verified',
  skillName: 'PDF Summarisation',
  priceMax: 0.05,
});

const bestDeal = result.gigs[0]; // returns AgentMarketGig
```

---

## 3. AgentMarket List: `agentmarket.list(gigSchema)`

**Status**: Placeholder ready for write-side implementation.

**Target Location**: `src/lib/agents/api.ts` - to be called by Fiver Seller agent.

**Expected Contract** (TBD):
```typescript
async function listGig(gig: AgentMarketGig): Promise<{ success: boolean; cid?: string }>;
```

**Note**: Query side (`queryMarketplace`) is fully functional. List side will store gigs to 0G Storage (Nisarg owns integration). Currently accepts `AgentMarketGig` shape defined above.

---

## 4. x402 Payment Response Contract

**Location**: `src/app/api/pay/x402/route.ts`

**Endpoint**: `POST /api/pay/x402`

**Request Body**:
```typescript
interface X402PaymentBody {
  to: string;        // recipient ENS or address
  amount: number;    // USDC amount
  description?: string;
}
```

**Response (Success)**:
```typescript
{
  success: true,
  txHash: string;     // mock hash for testing
  status: 'settled';
  to: string;
  amount: number;
  description?: string;
}
```

**Response (Error)**:
```typescript
{
  success: false,
  error: {
    code: 'INVALID_INPUT' | 'INTERNAL_ERROR';
    message: string;
  };
}
```

**Client Helper** (`src/lib/agents/api.ts`):
```typescript
async payWithX402(to: string, amount: number, description: string): Promise<{ txHash: string; status: string }>
```

**Usage by Nisarg**:
```typescript
import { payWithX402 } from '@/lib/agents/api';

// When Executor needs to pay for a hired skill
try {
  const result = await payWithX402(
    'summarizer.agentforge.eth',
    0.02,
    'HIRE:PDF Summarisation'
  );
  console.log(`Payment: ${result.status} · ${result.txHash}`);
} catch (error) {
  console.error('x402 payment failed:', error);
}
```

---

## 5. ENS Display & Lookup: `useWallet()` + `EnsLookupPanel`

**Location**: `src/lib/hooks/useWallet.ts` + `src/components/web3/EnsLookupPanel.tsx`

**Hook Contract** (`useWallet()`):
```typescript
interface WalletData {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  connector: Connector | undefined;
  ensName: string | null;
  displayName: string | null;  // fallback to address if no ENS
  balance: Balance | undefined;
  disconnect: () => void;
}
```

**Component**: `<EnsLookupPanel />` 
- Shows connected ENS identity 
- Resolves ENS name ↔ address bidirectionally
- Integrated into navbar + mobile menu

**Usage by Nisarg**:
```typescript
import { useWallet } from '@/lib/hooks/useWallet';

function AgentCard({ agent }) {
  const { ensName } = useWallet();
  
  // Display user's ENS identity
  return <div>{ensName || 'Not connected'}</div>;
}
```

---

## Summary for Integration

| Interface | Status | Location | Ready for |
|-----------|--------|----------|-----------|
| `axl.send()` | ✅ | `src/lib/agents/axl.ts` | Nisarg runtime |
| `axl.onMessage()` | ✅ | `src/lib/agents/axl.ts` | Nisarg listener |
| `queryMarketplace()` | ✅ | `src/lib/agents/api.ts` | Nisarg Planner |
| `listGig()` | 🔄 Placeholder | TBD | Nisarg Seller agent |
| `payWithX402()` | ✅ | `src/lib/agents/api.ts` | Nisarg runtime + UI |
| `/api/pay/x402` | ✅ | `src/app/api/pay/x402/route.ts` | Payment backend |
| ENS resolve | ✅ | `src/lib/hooks/useWallet.ts` | UI display |

All interfaces are **read-ready for integration**. The only placeholder is `listGig()`, which awaits Nisarg's 0G Storage write layer.

---

## Next Steps

1. **Nisarg** wires these contracts into:
   - Planner agent runtime to query and hire
   - Seller agent runtime to list skills (after 0G Storage integration)
   - AXL listener to receive job briefs and respond

2. **Kartik** uses `payWithX402()` result as the handoff point for x402 + KeeperHub settlement

3. **Siddharth** continues with demo-readiness tasks (section 6 of checklist)
