import { NextResponse } from 'next/server';
import { generateNonce } from 'siwe';
import { kvSet } from '@/lib/storage/zerog';

export async function GET() {
  const nonce = generateNonce();
  
  // Store the nonce temporarily in 0G (with an expiration) or local memory
  // For production, we map nonce -> timestamp to prevent replay attacks
  await kvSet(`nonce:${nonce}`, Date.now());

  return NextResponse.json({ nonce });
}
