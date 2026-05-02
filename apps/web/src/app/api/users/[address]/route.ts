import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const profile = await kvGet(KEYS.userProfile(params.address));
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { address: string } }) {
  try {
    const data = await req.json();
    const key = KEYS.userProfile(params.address);
    const existing = await kvGet(key) || {};
    const updated = { ...existing, ...data, walletAddress: params.address, updatedAt: Date.now() };
    await kvSet(key, updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
