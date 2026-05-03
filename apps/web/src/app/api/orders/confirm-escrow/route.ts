import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet, logAppend, STREAMS } from '@/lib/storage/zerog';

export async function POST(req: NextRequest) {
  try {
    const { orderId, txHash, keeperHubJobId } = await req.json();

    if (!orderId || !txHash) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const orderRecord = await kvGet<any>(`order:${orderId}`);
    if (!orderRecord) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Mark as locked
    orderRecord.state = 'ESCROW_LOCKED';
    orderRecord.escrowTxHash = txHash;
    orderRecord.keeperHubJobId = keeperHubJobId;
    orderRecord.escrowLockedAt = Date.now();

    await kvSet(`order:${orderId}`, orderRecord);
    await logAppend(STREAMS.orderEvents(orderId), { type: 'ESCROW_LOCKED', orderId, txHash, keeperHubJobId });

    // Since we are mocking the event listener, if the tier is > 1, we start execution here
    if (orderRecord.tier === 3) {
      // Background execution via fetch (fire and forget) to simulate BullMQ
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/${orderId}/harness`, { method: 'POST' }).catch(console.error);
    } else if (orderRecord.tier === 2) {
      // MoA engine
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/orders/${orderId}/moa`, { method: 'POST' }).catch(console.error);
    }

    return NextResponse.json({ success: true, state: orderRecord.state });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
