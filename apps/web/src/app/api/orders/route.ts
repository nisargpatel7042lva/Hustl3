import { NextResponse } from 'next/server';
import { kvSet, kvGet, logAppend, KEYS, STREAMS } from '@/lib/storage/zerog';
import { agentExecutionQueue } from '@/lib/queue/processor';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { gigId, buyerWallet, sellerWallet, requirements, formatInstructions } = data;
    
    if (!gigId || !buyerWallet || !sellerWallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = uuidv4();
    const orderData = {
      orderId,
      gigId,
      buyerWallet,
      sellerWallet,
      requirements,
      formatInstructions,
      state: 'PAYMENT_PENDING',
      createdAt: Date.now(),
      history: [{ state: 'CREATED', timestamp: Date.now() }]
    };

    // Save order to KV
    await kvSet(KEYS.orderData(orderId), orderData);
    
    // Append to Log
    await logAppend(STREAMS.orderEvents(orderId), {
      type: 'ORDER_CREATED',
      payload: orderData
    });

    return NextResponse.json(orderData);
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Normally list orders by user. For now, a simple placeholder.
  return NextResponse.json([]);
}
