import { NextResponse } from 'next/server';
import { kvListByPrefix, kvSet, KEYS, STREAMS, logAppend } from '@/lib/storage/zerog';
import { reverseResolveENS } from '@/lib/blockchain/ens';
import { v4 as uuidv4 } from 'uuid';

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');
    
    // Fetch all gigs from 0G KV
    const gigsItems = await kvListByPrefix<any>('gigs:');
    const gigs = gigsItems.map(item => item.value).filter(g => g && g.active !== false);

    if (format === 'ens') {
       // Return just ENS names for discovery
       const ensNames = gigs.filter(g => g.sellerEns).map(g => g.sellerEns);
       return NextResponse.json({ ensNames: Array.from(new Set(ensNames)) });
    }

    // Enrich gigs with ENS names if not present
    const enrichedGigs = await Promise.all(
      gigs.map(async (gig) => {
        if (!gig.sellerEns && gig.sellerWallet) {
          const ensName = await getOrFetchEnsName(gig.sellerWallet, gig.sellerEns);
          return { ...gig, sellerEns: ensName };
        }
        return gig;
      })
    );

    // Apply filtering
    let filtered = enrichedGigs;
    
    const category = searchParams.get('category');
    if (category) filtered = filtered.filter(g => g.category === category);
    
    const sellerType = searchParams.get('sellerType');
    if (sellerType) filtered = filtered.filter(g => g.sellerType === sellerType);
    
    const q = searchParams.get('q');
    if (q) {
      const lowerQ = q.toLowerCase();
      filtered = filtered.filter(g => 
        (g.title && g.title.toLowerCase().includes(lowerQ)) || 
        (g.description && g.description.toLowerCase().includes(lowerQ))
      );
    }

    // Default sorting (newest first)
    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Failed to fetch gigs:', error);
    return NextResponse.json({ error: 'Failed to fetch gigs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // In production, validate JWT to get seller address
    const sellerWallet = data.sellerWallet || '0xTEST'; 
    const gigId = uuidv4();
    
    // Resolve ENS if not provided
    let sellerEns = data.sellerEns;
    if (!sellerEns && sellerWallet && sellerWallet !== '0xTEST') {
      try {
        sellerEns = await getOrFetchEnsName(sellerWallet);
      } catch (error) {
        console.error('Failed to resolve ENS during gig creation:', error);
      }
    }
    
    const gigData = {
      ...data,
      gigId,
      sellerWallet,
      sellerEns,
      createdAt: Date.now(),
      active: true,
      totalOrders: 0,
      averageRating: 0
    };

    // Store in 0G KV
    await kvSet(KEYS.gigData(gigId), gigData);
    
    // Append to Marketplace Log
    await logAppend(STREAMS.marketplaceIndex, {
      type: 'GIG_CREATED',
      gigId,
      category: gigData.category,
      price: gigData.price,
      sellerType: gigData.sellerType,
      sellerEns: sellerEns,
    });

    return NextResponse.json(gigData, { status: 201 });
  } catch (error) {
    console.error('Failed to create gig:', error);
    return NextResponse.json({ error: 'Failed to create gig', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

