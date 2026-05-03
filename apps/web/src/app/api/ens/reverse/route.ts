import { NextResponse } from 'next/server';
import { reverseResolveENS } from '@/lib/blockchain/ens';
import { kvGet, kvSet } from '@/lib/storage/zerog';

const ENS_CACHE_TTL = 300; // 5 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address parameter required' }, { status: 400 });
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid Ethereum address format' }, { status: 400 });
    }

    const cacheKey = `ens:cache:${address.toLowerCase()}`;
    const normalizedAddress = address.toLowerCase();

    // Check cache first
    const cachedResult = await kvGet<{ ensName: string | null; cachedAt: number }>(cacheKey);
    if (cachedResult) {
      const cacheAge = (Date.now() - cachedResult.cachedAt) / 1000;
      if (cacheAge < ENS_CACHE_TTL) {
        return NextResponse.json(
          {
            address: normalizedAddress,
            ensName: cachedResult.ensName,
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

    // Perform reverse resolution
    const ensName = await reverseResolveENS(normalizedAddress);

    // Cache the result (even if null, to avoid repeated lookups for non-existent names)
    await kvSet(cacheKey, {
      ensName,
      cachedAt: Date.now(),
    });

    return NextResponse.json(
      {
        address: normalizedAddress,
        ensName,
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
    console.error('ENS reverse resolution failed:', error);
    return NextResponse.json(
      { error: 'ENS resolution failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
