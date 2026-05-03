import { NextResponse } from 'next/server';
import { resolveENS, getENSTextRecord } from '@/lib/blockchain/ens';
import { kvGet, kvSet } from '@/lib/storage/zerog';

const ENS_CACHE_TTL = 300; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const normalizedName = name.toLowerCase();
    const cacheKey = `ens:forward:${normalizedName}`;

    // Check cache first
    const cachedResult = await kvGet<{ address: string | null; avatar: string | null; description: string | null; cachedAt: number }>(cacheKey);
    if (cachedResult) {
      const cacheAge = (Date.now() - cachedResult.cachedAt) / 1000;
      if (cacheAge < ENS_CACHE_TTL) {
        if (!cachedResult.address) {
          return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'x-ens-cached': 'true' } });
        }
        return NextResponse.json(
          { 
            name: normalizedName,
            address: cachedResult.address, 
            avatar: cachedResult.avatar, 
            description: cachedResult.description,
            cached: true,
            cacheAge: Math.floor(cacheAge),
          },
          {
            headers: {
              'x-ens-cached': 'true',
              'Cache-Control': 'public, max-age=60',
            },
          }
        );
      }
    }

    // Perform forward resolution
    const address = await resolveENS(normalizedName);
    if (!address) {
      // Cache the miss to avoid repeated lookups
      await kvSet(cacheKey, {
        address: null,
        avatar: null,
        description: null,
        cachedAt: Date.now(),
      });
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    const avatar = await getENSTextRecord(normalizedName, 'avatar');
    const description = await getENSTextRecord(normalizedName, 'description');

    // Cache the result
    await kvSet(cacheKey, {
      address,
      avatar,
      description,
      cachedAt: Date.now(),
    });

    return NextResponse.json(
      { 
        name: normalizedName,
        address, 
        avatar, 
        description,
        cached: false,
      },
      {
        headers: {
          'x-ens-cached': 'false',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('ENS resolution failed:', error);
    return NextResponse.json({ error: 'Resolution failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
