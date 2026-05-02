import { NextResponse } from 'next/server';
import { executeSwap } from '@/lib/payments/uniswap';

export async function POST(req: Request) {
  try {
    const { walletAddress, quoteData, signature } = await req.json();
    
    // Verify signature in production before executing swap
    
    const txHash = await executeSwap(walletAddress, quoteData);
    return NextResponse.json({ success: true, txHash });
  } catch (error) {
    return NextResponse.json({ error: 'Swap execution failed' }, { status: 500 });
  }
}
