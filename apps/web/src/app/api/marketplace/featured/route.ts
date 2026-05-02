import { NextResponse } from 'next/server';
import { kvListByPrefix } from '@/lib/storage/zerog';

export async function GET() {
  try {
    const gigsItems = await kvListByPrefix<any>('gigs:');
    let gigs = gigsItems.map(item => item.value).filter(g => g && g.active !== false);
    
    // Sort by rating or total orders
    gigs.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    
    // Return top 4
    return NextResponse.json(gigs.slice(0, 4));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch featured gigs' }, { status: 500 });
  }
}
