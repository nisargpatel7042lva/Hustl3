import { NextResponse } from 'next/server';
import { reverseResolveENS } from '@/lib/blockchain/ens';
import { kvGet, kvSet } from '@/lib/storage/zerog';

const ENS_CACHE_TTL = 300; // 5 minutes

interface BulkResolveRequest {
  addresses: string[];
}

interface ResolvedAddress {
  address: string;
  ensName: string | null;
  cached: boolean;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as BulkResolveRequest;
    const { addresses } = body;

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return NextResponse.json(
        { error: 'addresses array required and must not be empty' },
        { status: 400 }
      );
    }

    if (addresses.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 addresses per request' },
        { status: 400 }
      );
    }

    // Validate all addresses
    const validAddresses = addresses.map((addr) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
        throw new Error(`Invalid address format: ${addr}`);
      }
      return addr.toLowerCase();
    });

    // Resolve all addresses in parallel
    const results: ResolvedAddress[] = await Promise.all(
      validAddresses.map(async (address) => {
        const cacheKey = `ens:cache:${address}`;

        // Check cache first
        const cachedResult = await kvGet<{ ensName: string | null; cachedAt: number }>(cacheKey);
        if (cachedResult) {
          const cacheAge = (Date.now() - cachedResult.cachedAt) / 1000;
          if (cacheAge < ENS_CACHE_TTL) {
            return {
              address,
              ensName: cachedResult.ensName,
              cached: true,
            };
          }
        }

        // Perform reverse resolution
        const ensName = await reverseResolveENS(address);

        // Cache the result
        await kvSet(cacheKey, {
          ensName,
          cachedAt: Date.now(),
        });

        return {
          address,
          ensName,
          cached: false,
        };
      })
    );

    const cachedCount = results.filter((r) => r.cached).length;
    const freshCount = results.length - cachedCount;

    return NextResponse.json(
      {
        total: results.length,
        cached: cachedCount,
        fresh: freshCount,
        results,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60',
        },
      }
    );
  } catch (error) {
    console.error('Bulk ENS resolution failed:', error);
    return NextResponse.json(
      {
        error: 'Bulk resolution failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
