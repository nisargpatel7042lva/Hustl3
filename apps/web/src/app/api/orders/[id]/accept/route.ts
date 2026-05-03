import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS, STREAMS, logAppend } from '@/lib/storage/zerog';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await kvGet<any>(KEYS.orderData(id));
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    if (order.state !== 'PAYMENT_PENDING') {
      return NextResponse.json({ error: `Cannot accept order in state ${order.state}` }, { status: 400 });
    }
    
    order.state = 'ACCEPTED';
    order.history.push({ state: 'ACCEPTED', timestamp: Date.now() });
    
    await kvSet(KEYS.orderData(id), order);
    await logAppend(STREAMS.orderEvents(id), { type: 'ORDER_ACCEPTED', payload: order });
    
    // In production, we would queue the harness job here if it's an AI agent gig
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to accept order:', error);
    return NextResponse.json({ error: 'Failed to accept order' }, { status: 500 });
  }
}
