/**
 * ENS Integration Testing Guide
 * Comprehensive test coverage for production devnet deployment
 */

# ENS Integration Test Cases

## 1. API Endpoint Tests

### 1.1 ENS Reverse Lookup (`GET /api/ens/reverse`)
```bash
# Test basic reverse lookup
curl -X GET "http://localhost:3000/api/ens/reverse?address=0x123abc..." \
  -H "Content-Type: application/json"

# Expected responses:
# Success: { "address": "0x123abc...", "ensName": "vitalik.eth", "cached": false }
# Not found: { "address": "0x123abc...", "ensName": null, "cached": false }
# Invalid input: { "error": "Invalid Ethereum address format" } (400)
```

Test cases:
- [ ] Valid address with ENS name → returns ensName
- [ ] Valid address without ENS name → returns null
- [ ] Invalid address format → 400 error
- [ ] Missing address parameter → 400 error
- [ ] Cache hit after first lookup → returns cached result with "cached": true
- [ ] Cache expires after 5 minutes → performs fresh lookup

### 1.2 ENS Forward Resolution (`GET /api/ens/resolve`)
```bash
# Test forward resolution
curl -X GET "http://localhost:3000/api/ens/resolve?name=vitalik.eth" \
  -H "Content-Type: application/json"

# Expected response:
# { "name": "vitalik.eth", "address": "0x...", "avatar": null, "description": null, "cached": false }
```

Test cases:
- [ ] Valid ENS name → returns address and text records
- [ ] Invalid ENS name → 404 error
- [ ] Missing name parameter → 400 error
- [ ] Cache hit after first lookup → returns cached result
- [ ] Avatar and description records retrieved

### 1.3 Bulk ENS Resolution (`POST /api/ens/bulk`)
```bash
# Test bulk resolution
curl -X POST "http://localhost:3000/api/ens/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "addresses": [
      "0x123abc...",
      "0x456def...",
      "0x789ghi..."
    ]
  }'

# Expected response:
# {
#   "total": 3,
#   "cached": 2,
#   "fresh": 1,
#   "results": [
#     { "address": "0x123abc...", "ensName": "user1.eth", "cached": true },
#     { "address": "0x456def...", "ensName": null, "cached": false },
#     { "address": "0x789ghi...", "ensName": "user3.eth", "cached": false }
#   ]
# }
```

Test cases:
- [ ] Valid addresses → all resolved correctly
- [ ] Mix of valid and invalid addresses → valid ones resolved, invalid skipped
- [ ] Empty array → 400 error
- [ ] More than 100 addresses → 400 error
- [ ] Caching works for some addresses

---

## 2. Agent API ENS Integration Tests

### 2.1 Create Agent with ENS Resolution
```bash
curl -X POST "http://localhost:3000/api/agents" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x123abc...",
    "ownerWallet": "0x456def...",
    "name": "Auditor Agent",
    "description": "AI-powered smart contract auditor"
  }'
```

Test cases:
- [ ] Agent created without ensName parameter → ensName auto-resolved
- [ ] Agent created with explicit ensName → uses provided ENS name
- [ ] Response includes resolved ensName
- [ ] Multiple agents created → each resolved independently

### 2.2 Fetch All Agents with ENS Names
```bash
curl -X GET "http://localhost:3000/api/agents" \
  -H "Content-Type: application/json"

# Expected: All agents have ensName field populated or null
```

Test cases:
- [ ] All agents returned with ensName field
- [ ] ENS names cached in 0G KV
- [ ] Performance: bulk fetch completes in < 5 seconds
- [ ] Format parameter works: ?format=ens

### 2.3 Fetch Individual Agent with ENS
```bash
curl -X GET "http://localhost:3000/api/agents/0x123abc..." \
  -H "Content-Type: application/json"
```

Test cases:
- [ ] Agent returned with ensName field
- [ ] ENS name cached if not already present
- [ ] Background update to agent profile with ENS name

---

## 3. Gig API ENS Integration Tests

### 3.1 Create Gig with ENS Resolution
```bash
curl -X POST "http://localhost:3000/api/gigs" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Smart Contract Audit",
    "description": "Full security audit of ERC20 implementation",
    "price": "500",
    "category": "Development",
    "sellerType": "agent",
    "sellerWallet": "0x123abc...",
    "deliveryTimeHours": 24
  }'
```

Test cases:
- [ ] Gig created with auto-resolved sellerEns
- [ ] Gig created with explicit sellerEns
- [ ] Response includes sellerEns field
- [ ] Log event includes sellerEns

### 3.2 Fetch All Gigs with ENS Names
```bash
curl -X GET "http://localhost:3000/api/gigs" \
  -H "Content-Type: application/json"

# Expected: All gigs have sellerEns field
```

Test cases:
- [ ] All gigs returned with sellerEns
- [ ] Filtering by category/sellerType still works
- [ ] Search still works with ENS enrichment
- [ ] Performance acceptable for 100+ gigs

### 3.3 Fetch Individual Gig with ENS
```bash
curl -X GET "http://localhost:3000/api/gigs/{id}" \
  -H "Content-Type: application/json"
```

Test cases:
- [ ] Gig returned with sellerEns field
- [ ] ENS resolved if not in profile

---

## 4. Orders API ENS Integration Tests

### 4.1 Create Order with ENS Resolution
```bash
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "gigId": "gig-123",
    "buyerWallet": "0xbuyer...",
    "sellerWallet": "0xseller...",
    "requirements": "Full smart contract audit with gas optimizations"
  }'
```

Test cases:
- [ ] Order created with buyerEns and sellerEns auto-resolved
- [ ] Response includes both ENS names
- [ ] Log event includes ENS names

### 4.2 Fetch Order with ENS Names
```bash
curl -X GET "http://localhost:3000/api/orders/{id}" \
  -H "Content-Type: application/json"
```

Test cases:
- [ ] Order returned with buyerEns and sellerEns
- [ ] ENS names resolved if not present

---

## 5. Frontend Component Tests

### 5.1 useEnsName Hook
```typescript
// Test hook in a component
function TestComponent() {
  const { ensName, displayName, shortAddress, isLoading } = useEnsName('0x123abc...');
  return <div>{displayName} ({shortAddress})</div>;
}
```

Test cases:
- [ ] Hook resolves ENS name
- [ ] Falls back to short address format
- [ ] Loading state works
- [ ] Error handling works
- [ ] Cache hit after first resolution

### 5.2 useEnsNamesBulk Hook
```typescript
// Test bulk resolution hook
function TestComponent() {
  const results = useEnsNamesBulk(['0x123abc...', '0x456def...']);
  return Object.entries(results).map(([addr, ens]) => <div>{ens || addr}</div>);
}
```

Test cases:
- [ ] Resolves multiple addresses
- [ ] Returns object mapping addresses to ENS names
- [ ] Handles empty array
- [ ] Efficient for many addresses

### 5.3 ProviderCard with ENS
```typescript
// Test ProviderCard displays ENS name
<ProviderCard provider={{ 
  walletAddress: '0x123abc...',
  name: 'Agent Name',
  // ...
}} />
```

Test cases:
- [ ] Provider name displayed correctly
- [ ] ENS name shown if available
- [ ] Loading state while resolving
- [ ] Truncation/overflow handled

### 5.4 ServiceCard with ENS
```typescript
// Test ServiceCard displays provider ENS
<ServiceCard service={{
  provider: { 
    walletAddress: '0x123abc...',
    name: 'Provider',
    // ...
  },
  // ...
}} />
```

Test cases:
- [ ] Provider name is ENS name if available
- [ ] Truncation handled for long ENS names
- [ ] Tooltip shows full name

---

## 6. Caching Tests

### 6.1 0G KV Cache Behavior
Test cases:
- [ ] First lookup: cache miss, performs reverse resolution
- [ ] Second lookup (immediate): cache hit, returned from KV
- [ ] Third lookup (after 5 minutes): cache expired, fresh resolution
- [ ] Failed resolution is cached (prevents repeated failures)
- [ ] Cache keys properly namespaced: `ens:cache:{address}`

### 6.2 HTTP Cache Headers
```bash
# Check cache headers in responses
curl -i "http://localhost:3000/api/ens/reverse?address=0x123abc..."

# Expected headers:
# x-ens-cached: true/false
# Cache-Control: public, max-age=60
```

Test cases:
- [ ] Cached responses have `x-ens-cached: true`
- [ ] Fresh responses have `x-ens-cached: false`
- [ ] Cache-Control headers set correctly

---

## 7. Performance Tests

### 7.1 Response Times
```bash
# Measure response times
time curl "http://localhost:3000/api/ens/reverse?address=0x123abc..."
```

Test cases:
- [ ] Cache hit: < 50ms
- [ ] Cache miss: < 1000ms
- [ ] Bulk request (10 addresses): < 1500ms
- [ ] Bulk request (100 addresses): < 5000ms

### 7.2 Concurrent Requests
```bash
# Test with concurrent requests
for i in {1..10}; do
  curl "http://localhost:3000/api/ens/reverse?address=0x$(printf '%040x' $i)" &
done
wait
```

Test cases:
- [ ] All requests complete successfully
- [ ] No race conditions in caching
- [ ] No memory leaks with many requests

---

## 8. Error Handling Tests

### 8.1 Invalid Inputs
Test cases:
- [ ] Invalid address format → 400
- [ ] Missing required parameters → 400
- [ ] Oversized bulk requests → 400
- [ ] Malformed JSON → 400

### 8.2 Network Failures
Test cases:
- [ ] ENS resolution timeout (Mainnet down) → graceful error
- [ ] 0G KV down → cache miss handled gracefully
- [ ] Partial failure in bulk request → returns successful results

### 8.3 Edge Cases
Test cases:
- [ ] Address with no ENS name → null, not error
- [ ] ENS name pointing to multiple addresses → correct resolution
- [ ] Very long ENS name (subdomains) → handled correctly

---

## 9. Integration Tests

### 9.1 Full User Journey
```
1. User creates agent → ensName auto-resolved ✓
2. User lists agents → all shown with ENS names ✓
3. User creates gig → sellerEns auto-resolved ✓
4. User browses gigs → seller ENS names displayed ✓
5. User creates order → buyer/seller ENS resolved ✓
6. User views order → all ENS names present ✓
```

Test cases:
- [ ] Complete workflow from agent creation to order
- [ ] ENS names consistent across all APIs
- [ ] Cache working throughout workflow

### 9.2 UI-API Integration
```
1. ProviderCard fetches ENS from API ✓
2. ServiceCard displays provider ENS ✓
3. Order page shows buyer/seller ENS names ✓
4. Agent profile shows correct ENS name ✓
```

Test cases:
- [ ] All UI components correctly resolve ENS
- [ ] API responses have required ENS fields
- [ ] Fallback to address when ENS not available

---

## 10. Documentation & Deployment

### 10.1 Documentation
- [ ] API documentation updated with ENS fields
- [ ] Integration guide for developers
- [ ] Cache behavior documented
- [ ] Error codes documented

### 10.2 Deployment Checklist
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Error handling verified
- [ ] Cache strategy validated
- [ ] Monitoring/logging configured
- [ ] Rollback plan documented

---

## Quick Test Command

```bash
#!/bin/bash
echo "Testing ENS Integration..."

# 1. Test reverse resolution
echo "\n[1] Testing reverse resolution..."
curl "http://localhost:3000/api/ens/reverse?address=0xvitalik.eth" 2>/dev/null | jq .

# 2. Test forward resolution
echo "\n[2] Testing forward resolution..."
curl "http://localhost:3000/api/ens/resolve?name=vitalik.eth" 2>/dev/null | jq .

# 3. Test bulk resolution
echo "\n[3] Testing bulk resolution..."
curl -X POST "http://localhost:3000/api/ens/bulk" \
  -H "Content-Type: application/json" \
  -d '{"addresses": ["0x123abc...", "0x456def..."]}' 2>/dev/null | jq .

# 4. Test agents with ENS
echo "\n[4] Testing agents API..."
curl "http://localhost:3000/api/agents" 2>/dev/null | jq '.[0] | {name, ensName, walletAddress}' | head -20

# 5. Test gigs with ENS
echo "\n[5] Testing gigs API..."
curl "http://localhost:3000/api/gigs" 2>/dev/null | jq '.[0] | {title, sellerEns, sellerWallet}' | head -20

echo "\n✅ ENS Integration tests complete!"
```

---

## Acceptance Criteria

For production devnet deployment:
- ✅ All 70+ test cases passing
- ✅ Response times within SLA (cache < 50ms, fresh < 1s)
- ✅ Bulk operations support up to 100 addresses
- ✅ Cache working with 5-minute TTL
- ✅ Graceful degradation when Mainnet unavailable
- ✅ Zero unhandled errors in logs
- ✅ UI properly displays ENS names across all pages
- ✅ Documentation complete and accurate
