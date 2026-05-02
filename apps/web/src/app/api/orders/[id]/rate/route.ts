import { NextResponse } from 'next/server';
import { submitRating } from '@/lib/reputation/calculator';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { raterAddress, rating, reviewText } = await req.json();
    const order = await kvGet<any>(KEYS.orderData(id));
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.state !== 'COMPLETED') return NextResponse.json({ error: 'Order must be completed to rate' }, { status: 400 });

    const subjectAddress = order.sellerWallet;
    await submitRating(subjectAddress, raterAddress, id, rating, reviewText);
    
    order.isRated = true;
    await kvSet(KEYS.orderData(id), order);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Rating failed' }, { status: 500 });
  }
}
