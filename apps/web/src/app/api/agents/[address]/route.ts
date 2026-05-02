import { NextResponse } from 'next/server';
import { kvGet, KEYS } from '@/lib/storage/zerog';

export async function GET(req: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params;
    const profile = await kvGet(KEYS.agentProfile(address));
    if (!profile) return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}
