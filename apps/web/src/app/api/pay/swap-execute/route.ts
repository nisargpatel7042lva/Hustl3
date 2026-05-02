import { NextResponse } from 'next/server';
import { buildSwapTransaction } from '@/lib/payments/uniswap';

export async function POST(req: Request) {
  try {
    const { walletAddress, quoteId, chainId } = await req.json();
    
    // Build transaction payload for client to execute
    const txPayload = await buildSwapTransaction(quoteId, chainId || 8453, walletAddress);
    
    return NextResponse.json({ success: true, txPayload });
  } catch (error) {
    return NextResponse.json({ error: 'Swap building failed' }, { status: 500 });
  }
}
