/**
 * 0G Storage abstraction layer.
 * All application data lives here — no PostgreSQL, no MongoDB, no Supabase.
 * Key schema:
 *   users:{walletAddress}:profile
 *   agents:{walletAddress}:profile
 *   agents:{walletAddress}:memory:current
 *   agents:{walletAddress}:skills:{skillId}
 *   gigs:{gigId}:data
 *   orders:{orderId}:data
 *   reputation:{walletAddress}:score
 *   orders:{orderId}:delivery
 *   marketplace:index            (Log — append-only event feed)
 */

export interface ZeroGKVEntry {
  key: string;
  value: string;
  updatedAt: number;
}

export interface ZeroGLogEntry {
  streamId: string;
  data: string;
  timestamp: number;
}

const ZEROG_KV_ENDPOINT  = process.env.ZEROG_KV_ENDPOINT  || 'http://localhost:6789';
const ZEROG_LOG_ENDPOINT = process.env.ZEROG_LOG_ENDPOINT || 'http://localhost:6790';
const ZEROG_API_KEY      = process.env.ZEROG_API_KEY      || '';

async function retryFetch(
  url: string,
  options: RequestInit,
  retries = 3,
  delayMs = 500,
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(ZEROG_API_KEY ? { Authorization: `Bearer ${ZEROG_API_KEY}` } : {}),
          ...(options.headers ?? {}),
        },
      });
      if (res.ok || res.status < 500) return res;
    } catch (err) {
      lastErr = err;
    }
    await new Promise(r => setTimeout(r, delayMs * 2 ** attempt));
  }
  throw lastErr ?? new Error('0G Storage request failed after retries');
}

// ─── KV Store ────────────────────────────────────────────────────────────────

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
  try {
    const res = await retryFetch(`${ZEROG_KV_ENDPOINT}/kv/${encodeURIComponent(key)}`, {
      method: 'GET',
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`kvGet failed: ${res.status}`);
    const body = (await res.json()) as { value?: string };
    if (!body.value) return null;
    return JSON.parse(body.value) as T;
  } catch (error: any) {
    if (error?.message?.includes('fetch failed') || error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('failed after retries')) {
      return null;
    }
    throw error;
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const res = await retryFetch(`${ZEROG_KV_ENDPOINT}/kv/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
  if (!res.ok) throw new Error(`kvSet failed: ${res.status}`);
}

export async function kvDelete(key: string): Promise<void> {
  const res = await retryFetch(`${ZEROG_KV_ENDPOINT}/kv/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 404) throw new Error(`kvDelete failed: ${res.status}`);
}

export async function kvListByPrefix<T = unknown>(prefix: string): Promise<Array<{ key: string; value: T }>> {
  try {
    const res = await retryFetch(
      `${ZEROG_KV_ENDPOINT}/kv?prefix=${encodeURIComponent(prefix)}`,
      { method: 'GET', cache: 'no-store' }, // Do not cache fetch in dev
    );
    if (!res.ok) throw new Error(`kvListByPrefix failed: ${res.status}`);
    const body = (await res.json()) as Array<{ key: string; value: string }>;
    return body.map(item => ({
      key: item.key,
      value: JSON.parse(item.value) as T,
    }));
  } catch (error: any) {
    if (error?.message?.includes('fetch failed') || error?.cause?.code === 'ECONNREFUSED' || error?.message?.includes('failed after retries')) {
      return getMockDataForPrefix<T>(prefix);
    }
    throw error;
  }
}

// ─── Mock Fallbacks ──────────────────────────────────────────────────────────

function getMockDataForPrefix<T>(prefix: string): Array<{ key: string; value: T }> {
  if (prefix.startsWith('gigs:')) {
    const mockGigs = [
      {
        gigId: 'mock-gig-1',
        title: 'Smart Contract Audit Agent',
        description: 'Autonomous AI agent that formally verifies your Solidity code and provides gas optimizations.',
        price: '500',
        sellerType: 'agent',
        sellerEns: 'auditor.eth',
        sellerWallet: '0x1234567890123456789012345678901234567890',
        category: 'Development',
        deliveryTimeHours: 1,
        averageRating: 4.9,
        totalOrders: 142,
        createdAt: Date.now() - 100000,
        active: true
      },
      {
        gigId: 'mock-gig-2',
        title: 'Defi Yield Strategy Bot',
        description: 'I will analyze cross-chain liquidity pools and build a customized yield farming strategy for your portfolio.',
        price: '250',
        sellerType: 'agent',
        sellerEns: 'yieldmax.eth',
        sellerWallet: '0x9876543210987654321098765432109876543210',
        category: 'Finance',
        deliveryTimeHours: 24,
        averageRating: 4.7,
        totalOrders: 89,
        createdAt: Date.now() - 500000,
        active: true
      },
      {
        gigId: 'mock-gig-3',
        title: 'Technical Whitepaper Writer',
        description: 'Expert human technical writer for your Web3 protocol. I translate complex tokenomics into clear prose.',
        price: '1200',
        sellerType: 'human',
        sellerEns: 'writer.eth',
        sellerWallet: '0xabcdef1234567890abcdef1234567890abcdef12',
        category: 'Writing',
        deliveryTimeHours: 72,
        averageRating: 5.0,
        totalOrders: 34,
        createdAt: Date.now() - 800000,
        active: true
      },
      {
        gigId: 'mock-gig-4',
        title: 'Automated Discord Mod',
        description: 'AI moderator that filters spam, answers FAQ using your docs, and manages community roles 24/7.',
        price: '100',
        sellerType: 'agent',
        sellerEns: 'modbot.eth',
        sellerWallet: '0x1111222233334444555566667777888899990000',
        category: 'Marketing',
        deliveryTimeHours: 2,
        averageRating: 4.8,
        totalOrders: 215,
        createdAt: Date.now() - 200000,
        active: true
      }
    ];
    return mockGigs.map(g => ({ key: KEYS.gigData(g.gigId), value: g as unknown as T }));
  }

  if (prefix.startsWith('agents:')) {
    const mockAgents = [
      {
        walletAddress: '0x1234567890123456789012345678901234567890',
        name: 'CodeReviewer Prime',
        description: 'AI specialized in high-level code review and security audits.',
        capabilities: ['Solidity', 'Rust', 'TypeScript'],
        status: 'online',
        reputation: 98,
        createdAt: Date.now() - 200000,
      },
      {
        walletAddress: '0x9876543210987654321098765432109876543210',
        name: 'Yield Optimizer Alpha',
        description: 'Calculates optimal routing for cross-chain swaps.',
        capabilities: ['DeFi', 'Analytics'],
        status: 'online',
        reputation: 94,
        createdAt: Date.now() - 300000,
      }
    ];
    // Return them formatted as profile entries
    return mockAgents.map(a => ({ key: KEYS.agentProfile(a.walletAddress), value: a as unknown as T }));
  }

  return [];
}

// ─── Log (append-only) ────────────────────────────────────────────────────────

export async function logAppend(streamId: string, data: unknown): Promise<void> {
  const res = await retryFetch(`${ZEROG_LOG_ENDPOINT}/log/${encodeURIComponent(streamId)}`, {
    method: 'POST',
    body: JSON.stringify({ data: JSON.stringify(data), timestamp: Date.now() }),
  });
  if (!res.ok) throw new Error(`logAppend failed: ${res.status}`);
}

export async function logGetRange<T = unknown>(
  streamId: string,
  from: number,
  to?: number,
): Promise<Array<{ offset: number; data: T; timestamp: number }>> {
  const params = new URLSearchParams({ from: String(from) });
  if (to !== undefined) params.set('to', String(to));
  const res = await retryFetch(
    `${ZEROG_LOG_ENDPOINT}/log/${encodeURIComponent(streamId)}?${params}`,
    { method: 'GET' },
  );
  if (!res.ok) throw new Error(`logGetRange failed: ${res.status}`);
  const body = (await res.json()) as Array<{ offset: number; data: string; timestamp: number }>;
  return body.map(e => ({ offset: e.offset, data: JSON.parse(e.data) as T, timestamp: e.timestamp }));
}

export async function logGetLast<T = unknown>(
  streamId: string,
  n: number,
): Promise<Array<{ offset: number; data: T; timestamp: number }>> {
  const res = await retryFetch(
    `${ZEROG_LOG_ENDPOINT}/log/${encodeURIComponent(streamId)}/last?n=${n}`,
    { method: 'GET' },
  );
  if (!res.ok) throw new Error(`logGetLast failed: ${res.status}`);
  const body = (await res.json()) as Array<{ offset: number; data: string; timestamp: number }>;
  return body.map(e => ({ offset: e.offset, data: JSON.parse(e.data) as T, timestamp: e.timestamp }));
}

// ─── Typed key helpers ────────────────────────────────────────────────────────

export const KEYS = {
  userProfile:     (addr: string) => `users:${addr.toLowerCase()}:profile`,
  agentProfile:    (addr: string) => `agents:${addr.toLowerCase()}:profile`,
  agentMemory:     (addr: string) => `agents:${addr.toLowerCase()}:memory:current`,
  agentSkill:      (addr: string, skillId: string) => `agents:${addr.toLowerCase()}:skills:${skillId}`,
  gigData:         (gigId: string) => `gigs:${gigId}:data`,
  orderData:       (orderId: string) => `orders:${orderId}:data`,
  orderDelivery:   (orderId: string) => `orders:${orderId}:delivery`,
  reputationScore: (addr: string) => `reputation:${addr.toLowerCase()}:score`,
} as const;

export const STREAMS = {
  marketplaceIndex:   'marketplace:index',
  orderEvents:        (orderId: string) => `orders:${orderId}:events`,
  agentActivity:      (addr: string) => `agents:${addr.toLowerCase()}:activity`,
  globalReputationLog: 'reputation:global:log',
} as const;
