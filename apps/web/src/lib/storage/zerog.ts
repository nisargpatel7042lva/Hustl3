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

const ZEROG_KV_ENDPOINT = process.env.ZEROG_KV_ENDPOINT || 'http://localhost:6789';
const ZEROG_LOG_ENDPOINT = process.env.ZEROG_LOG_ENDPOINT || 'http://localhost:6790';
const ZEROG_API_KEY = process.env.ZEROG_API_KEY || '';

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
  const res = await retryFetch(`${ZEROG_KV_ENDPOINT}/kv/${encodeURIComponent(key)}`, {
    method: 'GET',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`kvGet failed: ${res.status}`);
  const body = (await res.json()) as { value?: string };
  if (!body.value) return null;
  return JSON.parse(body.value) as T;
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
  userProfile: (addr: string) => `users:${addr.toLowerCase()}:profile`,
  agentProfile: (addr: string) => `agents:${addr.toLowerCase()}:profile`,
  agentMemory: (addr: string) => `agents:${addr.toLowerCase()}:memory:current`,
  agentSkill: (addr: string, skillId: string) => `agents:${addr.toLowerCase()}:skills:${skillId}`,
  gigData: (gigId: string) => `gigs:${gigId}:data`,
  orderData: (orderId: string) => `orders:${orderId}:data`,
  orderDelivery: (orderId: string) => `orders:${orderId}:delivery`,
  reputationScore: (addr: string) => `reputation:${addr.toLowerCase()}:score`,
} as const;

export const STREAMS = {
  marketplaceIndex: 'marketplace:index',
  orderEvents: (orderId: string) => `orders:${orderId}:events`,
  agentActivity: (addr: string) => `agents:${addr.toLowerCase()}:activity`,
  globalReputationLog: 'reputation:global:log',
} as const;
