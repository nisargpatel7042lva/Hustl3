import { NextRequest, NextResponse } from 'next/server';
import { getUniswapQuote } from '@/lib/blockchain/uniswap';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenIn = searchParams.get('tokenIn');
    const tokenOut = searchParams.get('tokenOut');
    const amount = searchParams.get('amount');
    
    if (!tokenIn || !tokenOut || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Default to Base chain for demo (8453)
    const quote = await getUniswapQuote({
      tokenInChainId: 8453,
      tokenIn,
      tokenOutChainId: 8453,
      tokenOut,
      amount,
      type: 'EXACT_OUTPUT', // E.g., we need exactly X ETH for the escrow
      swapper: '0x0000000000000000000000000000000000000000' // Placeholder
    });

    return NextResponse.json(quote);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
