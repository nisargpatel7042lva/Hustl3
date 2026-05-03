import { NextRequest, NextResponse } from 'next/server';
import { SiweMessage } from 'siwe';
import { SignJWT } from 'jose';
import { kvGet } from '@/lib/storage/zerog';

export async function POST(req: NextRequest) {
  try {
    const { message, signature } = await req.json();
    const siweMessage = new SiweMessage(message);

    // Verify SIWE message and signature
    const { data: fields } = await siweMessage.verify({ signature });

    // Ensure nonce is valid (check if it exists in our temporary 0G store)
    const nonceTimestamp = await kvGet<number>(`nonce:${fields.nonce}`);
    if (!nonceTimestamp) {
      return NextResponse.json({ ok: false, error: 'Invalid or expired nonce.' }, { status: 422 });
    }

    // Issue JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_hackathon');
    const token = await new SignJWT({ address: fields.address, sub: fields.address })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set HTTP-only cookie
    const response = NextResponse.json({ ok: true, address: fields.address });
    response.cookies.set('hustl3_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });

    return response;
  } catch (error: any) {
    console.error('SIWE Verification failed:', error);
    return NextResponse.json({ ok: false, error: 'Invalid SIWE message or signature' }, { status: 401 });
  }
}
