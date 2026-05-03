import { NextRequest, NextResponse } from 'next/server';
import { executeHarness } from '@/lib/agents/harness';
import { kvGet } from '@/lib/storage/zerog';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const orderRecord = await kvGet<any>(`order:${orderId}`);
    
    if (!orderRecord) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Call harness in background (serverless function)
    executeHarness(orderId, orderRecord.requirement || 'Execute task').catch(console.error);

    return NextResponse.json({ success: true, message: 'Harness execution started' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: orderId } = await params;
    const state = await kvGet<string>(`harness:${orderId}:state`) || 'NOT_STARTED';
    const graph = await kvGet<any[]>(`harness:${orderId}:graph`) || [];
    const delivery = await kvGet<any>(`harness:${orderId}:delivery`) || null;

    return NextResponse.json({ success: true, state, graph, delivery });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
