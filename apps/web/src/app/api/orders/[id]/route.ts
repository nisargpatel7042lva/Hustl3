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
    const order = await kvGet<any>(KEYS.orderData(id));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    // Enrich with ENS names if not present
    if (!order.buyerEns && order.buyerWallet) {
      const ensName = await getOrFetchEnsName(order.buyerWallet, order.buyerEns);
      if (ensName) {
        order.buyerEns = ensName;
      }
    }
    
    if (!order.sellerEns && order.sellerWallet) {
      const ensName = await getOrFetchEnsName(order.sellerWallet, order.sellerEns);
      if (ensName) {
        order.sellerEns = ensName;
      }
    }
    
    // Update order with ENS names in background if they were resolved
    if ((order.buyerEns || order.sellerEns) && 
        (!order.buyerEns || !order.sellerEns)) {
      await kvSet(KEYS.orderData(id), order).catch(() => {});
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
