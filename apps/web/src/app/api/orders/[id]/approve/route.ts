import { NextResponse } from 'next/server';
import { kvGet, kvSet, KEYS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await kvGet<any>(KEYS.orderData(id));
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Submit to KeeperHub BEFORE mutating order state.
    // If this throws, the order remains unchanged — no state mismatch.
    const jobId = await submitKeeperJob({
      contractAddress: process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '',
      abi: [{"inputs":[{"internalType":"string","name":"orderId","type":"string"}],"name":"releaseEscrow","outputs":[],"stateMutability":"nonpayable","type":"function"}],
      functionName: 'releaseEscrow',
      args: [id],
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
      priority: 'high',
      callbackUrl: `${process.env.APP_URL}/api/webhooks/keeperhub`,
      metadata: { orderId: id, action: 'releaseEscrow' },
    });

    // KeeperHub accepted the job — now safe to update order state
    order.state = 'COMPLETED';
    order.keeperJobId = jobId;
    order.history.push({ state: 'COMPLETED', timestamp: Date.now() });
    await kvSet(KEYS.orderData(id), order);

    return NextResponse.json(order);
  } catch (error) {
    console.error('[approve] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Approval failed' },
      { status: 500 }
    );
  }
}
