import { NextResponse } from 'next/server';
import { issueX402Challenge, verifyX402Payment } from '@/lib/payments/x402';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get('amount') || '1';
    
    const challenge = await issueX402Challenge(
      'order_dummy',
      BigInt(amount),
      'native',
      16600
    );
    return NextResponse.json({ challenge });
  } catch (error) {
    return NextResponse.json({ error: 'Challenge generation failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { confirmation, expectedAmount, expectedToken, buyerAddress } = await req.json();
    
    const verification = await verifyX402Payment(
      confirmation,
      BigInt(expectedAmount),
      expectedToken,
      buyerAddress
    );
    
    if (!verification.valid) {
      return NextResponse.json({ error: 'Invalid payment' }, { status: 402 });
    }

    return NextResponse.json({ success: true, message: 'Payment verified' });
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}