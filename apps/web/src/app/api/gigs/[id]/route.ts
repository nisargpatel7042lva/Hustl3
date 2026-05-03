import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { reverseResolveENS } from '@/lib/blockchain/ens';

const ENS_CACHE_TTL = 300; // 5 minutes

async function getOrFetchEnsName(walletAddress: string, cachedEnsName?: string): Promise<string | null> {
  // If already has ENS name, return it
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await kvGet<any>(KEYS.gigData(id));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    
    // Enrich with ENS name if not present
    if (!gig.sellerEns && gig.sellerWallet) {
      const ensName = await getOrFetchEnsName(gig.sellerWallet, gig.sellerEns);
      if (ensName) {
        gig.sellerEns = ensName;
        // Update gig with ENS name in background
        await kvSet(KEYS.gigData(id), gig).catch(() => {});
      }
    }
    
    return NextResponse.json(gig);
  } catch (error) {
    console.error('Failed to fetch gig:', error);
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 });
  }
}
