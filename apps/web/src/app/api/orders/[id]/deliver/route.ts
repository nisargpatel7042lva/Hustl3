import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { deliverableURI } = await req.json();
    const order = await kvGet<any>(KEYS.orderData(params.id));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    order.state = 'DELIVERED';
    order.deliveryContentURI = deliverableURI;
    order.history.push({ state: 'DELIVERED', timestamp: Date.now() });
    
    await kvSet(KEYS.orderData(params.id), order);

    await submitKeeperJob({
      contractAddress: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '',
      abi: [{"inputs":[{"internalType":"string","name":"orderId","type":"string"}],"name":"markDelivered","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      functionName: 'markDelivered',
      args: [params.id],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
      priority: 'high'
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Delivery failed' }, { status: 500 });
  }
}
