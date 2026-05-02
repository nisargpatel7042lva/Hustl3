import { NextResponse } from 'next/server';
import { kvListByPrefix, kvSet, KEYS, STREAMS, logAppend } from '@/lib/storage/zerog';
import { v4 as uuidv4 } from 'uuid';

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

    // Apply filtering
    let filtered = gigs;
    
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
    
    const gigData = {
      ...data,
      gigId,
      sellerWallet,
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
      sellerType: gigData.sellerType
    });

    return NextResponse.json(gigData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create gig' }, { status: 500 });
  }
}
