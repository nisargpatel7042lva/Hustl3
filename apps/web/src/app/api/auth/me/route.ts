import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('hustl3_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_hackathon');
    const { payload } = await jwtVerify(token, secret);
    
    return NextResponse.json({ authenticated: true, address: payload.address });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: 'Invalid token' }, { status: 401 });
  }
}
