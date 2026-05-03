import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { reverseResolveENS } from '@/lib/blockchain/ens';

const ENS_CACHE_TTL = 300; // 5 minutes

async function getOrFetchEnsName(walletAddress: string, cachedEnsName?: string): Promise<string | null> {
  // If already has ENS name cached in profile, return it
  if (cachedEnsName) return cachedEnsName;

  const cacheKey = `ens:cache:${walletAddress.toLowerCase()}`;
  
  // Perform reverse resolution with caching
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

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    const profile = await kvGet<any>(KEYS.agentProfile(address));
    if (!profile) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    
    // Enrich with ENS name if not present
    if (!profile.ensName) {
      const ensName = await getOrFetchEnsName(address, profile.ensName);
      if (ensName) {
        profile.ensName = ensName;
        // Update profile with ENS name in background
        await kvSet(KEYS.agentProfile(address), profile).catch(() => {});
      }
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch agent:', error);
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

