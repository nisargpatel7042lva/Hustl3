import { NextResponse } from 'next/server';
import { kvListByPrefix, kvSet, KEYS } from '@/lib/storage/zerog';
import { reverseResolveENS } from '@/lib/blockchain/ens';

const ENS_CACHE_TTL = 300; // 5 minutes

async function getOrFetchEnsName(walletAddress: string, cachedEnsName?: string): Promise<string | null> {
  // If already has ENS name cached in profile, return it
  if (cachedEnsName) return cachedEnsName;

  const cacheKey = `ens:cache:${walletAddress.toLowerCase()}`;
  
  // Try 0G cache first
  try {
    const cached = await kvListByPrefix<any>(cacheKey);
    if (cached.length > 0) {
      const cachedData = cached[0].value as { ensName: string | null; cachedAt: number };
      const cacheAge = (Date.now() - cachedData.cachedAt) / 1000;
      if (cacheAge < ENS_CACHE_TTL) {
        return cachedData.ensName;
      }
    }
  } catch {}

  // Perform reverse resolution
  try {
    const ensName = await reverseResolveENS(walletAddress);
    // Update cache
    await kvSet(cacheKey, {
      ensName,
      cachedAt: Date.now(),
    }).catch(() => {});
    return ensName;
  } catch (error) {
    console.error(`Failed to resolve ENS for ${walletAddress}:`, error);
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    
    // Fetch all agents from 0G KV
    const agentsItems = await kvListByPrefix<any>('agents:');
    // Filter out memory/skills, keep only profiles
    const agents = agentsItems
      .filter(item => item.key.endsWith(':profile'))
      .map(item => item.value);

    // Enrich agents with ENS names if not present
    const enrichedAgents = await Promise.all(
      agents.map(async (agent) => {
        if (!agent.ensName && agent.walletAddress) {
          const ensName = await getOrFetchEnsName(agent.walletAddress, agent.ensName);
          return { ...agent, ensName };
        }
        return agent;
      })
    );

    if (format === 'ens') {
       // Return just ENS names for discovery
       const ensNames = enrichedAgents.filter(a => a.ensName).map(a => a.ensName);
       return NextResponse.json({ ensNames: Array.from(new Set(ensNames)) });
    }

    return NextResponse.json(enrichedAgents);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { walletAddress, ensName, ownerWallet, agentType } = data;
    
    if (!walletAddress || !ownerWallet) {
      return NextResponse.json({ error: 'walletAddress and ownerWallet are required' }, { status: 400 });
    }
    
    // Resolve ENS if not provided
    let resolvedEnsName = ensName;
    if (!ensName && walletAddress) {
      try {
        resolvedEnsName = await getOrFetchEnsName(walletAddress);
      } catch (error) {
        console.error('Failed to resolve ENS during agent creation:', error);
      }
    }
    
    const agentProfile = {
      ...data,
      ensName: resolvedEnsName,
      accountType: 'agent',
      createdAt: Date.now(),
      status: 'idle',
      reputationScore: 0,
      totalOrders: 0,
      totalEarnings: 0,
      skills: []
    };

    // Store profile in 0G KV
    await kvSet(KEYS.agentProfile(walletAddress), agentProfile);
    
    // Initialize memory
    await kvSet(KEYS.agentMemory(walletAddress), {
      activeTaskId: null,
      recentContext: [],
      skills: {},
      preferences: {},
      metrics: { tasksCompleted: 0, successRate: 100, totalEarned: '0' },
      personality: data.personality || 'A professional Hustl3 AI Agent.'
    });

    return NextResponse.json(agentProfile, { status: 201 });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json({ error: 'Failed to create agent', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

