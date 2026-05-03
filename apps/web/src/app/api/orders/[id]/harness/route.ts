import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/storage/zerog';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const state = await kvGet<string>(`harness:${id}:state`);
    const graph = await kvGet<any>(`harness:${id}:graph`);
    const delivery = await kvGet<any>(`harness:${id}:delivery`);
    
    return NextResponse.json({
      state: state || 'NOT_STARTED',
      graph: graph || [],
      delivery: delivery || null
    });
  } catch (error) {
    console.error('Failed to fetch harness data:', error);
    return NextResponse.json({ error: 'Failed to fetch harness data' }, { status: 500 });
  }
}
