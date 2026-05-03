import { NextResponse } from 'next/server';
import { kvSet, kvGet, logAppend, KEYS, STREAMS } from '@/lib/storage/zerog';
import { reverseResolveENS } from '@/lib/blockchain/ens';
import { agentExecutionQueue } from '@/lib/queue/processor';
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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { gigId, buyerWallet, sellerWallet, buyerEns, sellerEns, requirements, formatInstructions } = data;
    
    if (!gigId || !buyerWallet || !sellerWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = uuidv4();
    
    // Resolve ENS names if not provided
    let resolvedBuyerEns = buyerEns;
    let resolvedSellerEns = sellerEns;
    
    if (!resolvedBuyerEns) {
      try {
        resolvedBuyerEns = await getOrFetchEnsName(buyerWallet);
      } catch (error) {
        console.error('Failed to resolve buyer ENS:', error);
      }
    }
    
    if (!resolvedSellerEns) {
      try {
        resolvedSellerEns = await getOrFetchEnsName(sellerWallet);
      } catch (error) {
        console.error('Failed to resolve seller ENS:', error);
      }
    }
    
    const orderData = {
      orderId,
      gigId,
      buyerWallet,
      buyerEns: resolvedBuyerEns,
      sellerWallet,
      sellerEns: resolvedSellerEns,
      requirements,
      formatInstructions,
      state: 'PAYMENT_PENDING',
      createdAt: Date.now(),
      history: [{ state: 'CREATED', timestamp: Date.now() }]
    };

    // Save order to KV
    await kvSet(KEYS.orderData(orderId), orderData);
    
    // Append to Log
    await logAppend(STREAMS.orderEvents(orderId), {
      type: 'ORDER_CREATED',
      payload: orderData
    });

    return NextResponse.json(orderData, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Normally list orders by user. For now, a simple placeholder.
  return NextResponse.json([]);
}
