import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { kvSet, kvGet, logAppend, STREAMS } from '@/lib/storage/zerog';
import { executeHarness } from '@/lib/agents/harness';
import { runMoAEngine } from '@/lib/agents/moa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gigId, buyerWallet, requirement } = body;

    // Fetch actual gig from 0G storage
    const gigData = await kvGet<any>(`gig:${gigId}`);
    if (!gigData) {
      return NextResponse.json({ error: 'Gig not found in 0G Storage' }, { status: 404 });
    }

    const orderId = uuidv4();
    const tier = gigData.tier || 1;

    const orderRecord = {
      orderId,
      gigId,
      buyerWallet,
      sellerWallet: gigData.sellerWallet,
      state: 'PAYMENT_PENDING',
      createdAt: Date.now(),
      tier,
      requirement
    };

    // Store Order
    await kvSet(`order:${orderId}`, orderRecord);
    await logAppend(STREAMS.orderEvents, { type: 'ORDER_CREATED', orderId, tier });

    // Handle complexity tiers asynchronously
    if (tier === 3) {
      // Tier 3: Trigger Agent Harness Orchestration
      // In production, this goes to BullMQ. Here we run async.
      executeHarness(orderId, requirement, gigData.blueprintHash).catch(console.error);
    } else if (tier === 2) {
      // Tier 2: Trigger MoA Engine
      runMoAEngine(orderId, requirement, {
        parallelWorkers: gigData.workers || 3,
        baseModel: 'qwen3.6-plus',
        aggregatorModel: 'qwen3.6-plus',
        aggregationStrategy: 'Synthesize'
      }).catch(console.error);
    } else {
      // Tier 1: Standard single agent execution
      // queue.add('soloExecution', { orderId, requirement })
    }

    return NextResponse.json({ success: true, orderId, tier });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}