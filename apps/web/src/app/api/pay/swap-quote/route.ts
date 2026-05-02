import { NextResponse } from 'next/server';
import { getSwapQuote } from '@/lib/payments/uniswap';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenIn = searchParams.get('tokenIn');
    const tokenOut = searchParams.get('tokenOut');
    const amountIn = searchParams.get('amountIn'); // NOTE: The Uniswap function uses amountOut
    
    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const quote = await getSwapQuote({
      tokenIn,
      tokenOut,
      amountOut: amountIn, // Mapping amountIn request to exact amountOut needed
      chainId: 8453, // Default to Base for now
      swapper: '0x0000000000000000000000000000000000000000'
    });
    
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get quote' }, { status: 500 });
  }
}
