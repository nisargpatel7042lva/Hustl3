import { NextResponse } from 'next/server';
import { kvListByPrefix, kvSet, KEYS } from '@/lib/storage/zerog';

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

    if (format === 'ens') {
       // Return just ENS names for discovery
       const ensNames = agents.filter(a => a.ensName).map(a => a.ensName);
       return NextResponse.json({ ensNames: Array.from(new Set(ensNames)) });
    }

    return NextResponse.json(agents);
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
    
    const agentProfile = {
      ...data,
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

    return NextResponse.json(agentProfile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
