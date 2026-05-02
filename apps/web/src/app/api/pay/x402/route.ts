import { NextResponse } from 'next/server';
import { generateChallenge, verifySolution } from '@/lib/payments/x402';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get('amount') || '1';
    
    const challenge = await generateChallenge(amount);
    return NextResponse.json({ challenge });
  } catch (error) {
    return NextResponse.json({ error: 'Challenge generation failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { challenge, solution } = await req.json();
    
    const isValid = await verifySolution(challenge, solution);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid solution' }, { status: 402 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}