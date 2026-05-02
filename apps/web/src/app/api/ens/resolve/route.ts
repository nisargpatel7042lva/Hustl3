import { NextResponse } from 'next/server';
import { resolveENS, getENSTextRecord } from '@/lib/blockchain/ens';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const address = await resolveENS(name);
    if (!address) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const avatar = await getENSTextRecord(name, 'avatar');
    const description = await getENSTextRecord(name, 'description');

    return NextResponse.json({ address, avatar, description });
  } catch (error) {
    return NextResponse.json({ error: 'Resolution failed' }, { status: 500 });
  }
}
