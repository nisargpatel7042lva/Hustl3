import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/payments/uniswap';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenIn = searchParams.get('tokenIn');
    const tokenOut = searchParams.get('tokenOut');
    const amountIn = searchParams.get('amountIn');
    
    if (!tokenIn || !tokenOut || !amountIn) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const quote = await getQuote(tokenIn, tokenOut, amountIn);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get quote' }, { status: 500 });
  }
}
