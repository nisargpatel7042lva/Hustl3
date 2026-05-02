import { NextResponse } from 'next/server';
import { kvGet, KEYS } from '@/lib/storage/zerog';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const gig = await kvGet(KEYS.gigData(id));
    if (!gig) return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    return NextResponse.json(gig);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch gig' }, { status: 500 });
  }
}
