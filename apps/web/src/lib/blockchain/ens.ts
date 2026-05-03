/**
 * ENS integration — forward/reverse resolution, text records, subname registration.
 * Uses ethers.js v6 ENS provider with RPC fallback.
 * Manages agent subnames under hustl3.eth.
 */
import { ethers } from 'ethers';

const BASE_RPC = process.env.BASE_RPC_URL || 'https://mainnet.base.org';

/**
 * RPC setup with fallback system
 */
const RPCS = [
  process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com',
  'https://rpc.flashbots.net',
  'https://eth-mainnet.g.alchemy.com/v2/demo',
];

function createProvider(url: string): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(url);
}

/**
 * Try multiple RPCs (fallback system)
 */
async function withFallback<T>(
  fn: (provider: ethers.JsonRpcProvider) => Promise<T>
): Promise<T | null> {
  for (const rpc of RPCS) {
    const provider = createProvider(rpc);
    try {
      return await fn(provider);
    } catch (err) {
      console.warn(`RPC failed (${rpc}), trying next...`);
    }
  }
  return null;
}

/**
 * Normalize ENS name
 */
function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Normalize Ethereum address safely (EIP-55)
 */
function normalizeAddress(address: string): string | null {
  try {
    return ethers.getAddress(address);
  } catch {
    return null;
  }
}

/**
 * Resolve ENS name → address (forward resolution).
 */
export async function resolveENS(name: string): Promise<string | null> {
  const normalized = normalizeName(name);
  const result = await withFallback(async (provider) => {
    const address = await provider.resolveName(normalized);
    return address;
  });
  return result;
}

/**
 * Reverse resolve address → primary ENS name.
 */
export async function reverseResolveENS(address: string): Promise<string | null> {
  const normalized = normalizeAddress(address);
  if (!normalized) {
    console.error('Invalid address format');
    return null;
  }

  const result = await withFallback(async (provider) => {
    const name = await provider.lookupAddress(normalized);
    return name;
  });
  return result;
}

/**
 * Read an ENS text record.
 */
export async function getENSTextRecord(name: string, key: string): Promise<string | null> {
  const normalized = normalizeName(name);
  const result = await withFallback(async (provider) => {
    const resolver = await provider.getResolver(normalized);
    if (!resolver) return null;
    return await resolver.getText(key);
  });
  return result;
}

/**
 * Read multiple ENS text records for an agent in one batch.
 */
export async function getAgentENSRecords(ensName: string): Promise<Record<string, string>> {
  const keys = [
    'com.hustl3.status',
    'com.hustl3.gigCategory',
    'com.hustl3.reputationScore',
    'com.hustl3.reputationURI',
    'com.hustl3.axlPeerId',
    'com.hustl3.computeModel',
    'com.hustl3.skillCount',
    'com.hustl3.totalOrders',
    'com.hustl3.storageRoot',
    'url',
    'description',
    'avatar',
  ];

  const result = await withFallback(async (provider) => {
    const resolver = await provider.getResolver(ensName);
    if (!resolver) return {};

    const results = await Promise.allSettled(keys.map(k => resolver.getText(k)));
    const records: Record<string, string> = {};
    for (let i = 0; i < keys.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled' && r.value) {
        records[keys[i]] = r.value;
      }
    }
    return records;
  });

  return result || {};
}

/**
 * Get the ENS subname for an agent.
 * e.g. "researcher-alpha" → "researcher-alpha.hustl3.eth"
 */
export function agentEnsName(slug: string): string {
  return `${slug}.hustl3.eth`;
}

/**
 * Generate all text record updates for an agent profile.
 * These are batched and sent via a multicall transaction through KeeperHub.
 */
export interface AgentTextRecordSet {
  ensName:         string;
  status:          string;
  gigCategory:     string;
  reputationScore: number;
  reputationURI:   string;
  axlPeerId:       string;
  computeModel:    string;
  skillCount:      number;
  totalOrders:     number;
  storageRoot:     string;
  profileUrl:      string;
}

export function buildTextRecordUpdates(
  data: AgentTextRecordSet,
): Array<{ key: string; value: string }> {
  return [
    { key: 'com.hustl3.status',          value: data.status },
    { key: 'com.hustl3.gigCategory',     value: data.gigCategory },
    { key: 'com.hustl3.reputationScore', value: String(data.reputationScore) },
    { key: 'com.hustl3.reputationURI',   value: data.reputationURI },
    { key: 'com.hustl3.axlPeerId',       value: data.axlPeerId },
    { key: 'com.hustl3.computeModel',    value: data.computeModel },
    { key: 'com.hustl3.skillCount',      value: String(data.skillCount) },
    { key: 'com.hustl3.totalOrders',     value: String(data.totalOrders) },
    { key: 'com.hustl3.storageRoot',     value: data.storageRoot },
    { key: 'url',                         value: data.profileUrl },
  ];
}

/**
 * Discover all Hustl3 agents by querying ENS subnames of hustl3.eth.
 * Returns agent ENS names readable by any external developer.
 */
export async function discoverAgentsByENS(): Promise<string[]> {
  // In production: query ENS subgraph for all subnames of hustl3.eth
  // For now: read from 0G Storage agent index and build ENS names
  const HUSTL3_PARENT = 'hustl3.eth';
  try {
    const res = await fetch(`/api/agents?format=ens`);
    if (!res.ok) return [];
    const data = (await res.json()) as { ensNames: string[] };
    return data.ensNames;
  } catch {
    return [];
  }
}

/**
 * Compute an agent's reputationURI — a pointer to their 0G Storage reputation doc.
 * This URI is stored in ENS text records for trustless verification.
 */
export function buildReputationURI(walletAddress: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://hustl3.xyz';
  return `${base}/api/reputation/${walletAddress.toLowerCase()}/document`;
}
