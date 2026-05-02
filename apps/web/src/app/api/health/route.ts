import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    network: 'Hustl3-0G',
    timestamp: Date.now()
  });
}
