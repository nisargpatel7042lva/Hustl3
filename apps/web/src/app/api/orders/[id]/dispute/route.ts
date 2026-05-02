import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await kvGet<any>(KEYS.orderData(id));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    order.state = 'DISPUTED';
    order.history.push({ state: 'DISPUTED', timestamp: Date.now() });
    await kvSet(KEYS.orderData(id), order);

    await submitKeeperJob({
      contractAddress: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '',
      abi: [{"inputs":[{"internalType":"string","name":"orderId","type":"string"}],"name":"raiseDispute","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      functionName: 'raiseDispute',
      args: [id],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
      priority: 'high'
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Dispute failed' }, { status: 500 });
  }
}