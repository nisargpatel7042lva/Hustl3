import { NextRequest, NextResponse } from 'next/server';
import { runMoAEngine } from '@/lib/agents/moa';
import { kvGet } from '@/lib/storage/zerog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const orderRecord = await kvGet<any>(`order:${orderId}`);
    
    if (!orderRecord) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Call MoA engine in background (serverless function)
    runMoAEngine(orderId, orderRecord.requirement || 'Execute task', {
      parallelWorkers: 3,
      baseModel: 'qwen3.6-plus',
      aggregatorModel: 'qwen3.6-plus',
      aggregationStrategy: 'Synthesize'
    }).catch(console.error);

    return NextResponse.json({ success: true, message: 'MoA execution started' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
