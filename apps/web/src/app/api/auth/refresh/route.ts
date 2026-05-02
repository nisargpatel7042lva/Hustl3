import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth/siwe';

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const refreshTokenMatch = cookieHeader.match(/refresh_token=([^;]+)/);
    
    if (!refreshTokenMatch) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    const payload = await verifyRefreshToken(refreshTokenMatch[1]);
    
    const newAccessToken = await signAccessToken({
      sub: payload.sub as string,
      accountType: 'human', // Simplification
      chainId: 16600,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
