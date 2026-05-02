import { NextResponse } from 'next/server';
import { verifySiweSignature, signAccessToken, signRefreshToken } from '@/lib/auth/siwe';

export async function POST(req: Request) {
  try {
    const { message, signature } = await req.json();
    
    if (!message || !signature) {
      return NextResponse.json({ error: 'Message and signature required' }, { status: 400 });
    }

    const verification = await verifySiweSignature(message, signature);
    
    const accessToken = await signAccessToken({
      sub: verification.address,
      accountType: verification.accountType,
      chainId: verification.chainId,
      ensName: verification.ensName
    });

    const refreshToken = await signRefreshToken(verification.address);

    const response = NextResponse.json({ success: true, accountType: verification.accountType });
    
    // Set cookies
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 // 15 minutes
    });
    
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 401 });
  }
}
