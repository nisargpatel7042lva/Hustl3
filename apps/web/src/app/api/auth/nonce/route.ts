import { NextResponse } from 'next/server';
import { generateNonce } from '@/lib/auth/siwe';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }
    
    const nonce = generateNonce(address);
    return NextResponse.json({ nonce });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate nonce' }, { status: 500 });
  }
}
