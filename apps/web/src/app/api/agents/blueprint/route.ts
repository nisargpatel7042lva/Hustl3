import { NextRequest, NextResponse } from 'next/server';
import { kvSet, logAppend, STREAMS } from '@/lib/storage/zerog';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { name, nodes, edges, tier } = await req.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'Empty blueprint' }, { status: 400 });
    }

    // Hash the blueprint to create a unique capability ID
    const blueprintString = JSON.stringify({ nodes, edges });
    const blueprintHash = crypto.createHash('sha256').update(blueprintString).digest('hex');

    // Store in 0G
    await kvSet(`blueprint:${blueprintHash}`, {
      name: name || 'Agent Team Blueprint',
      tier: tier || 3,
      nodes,
      edges,
      createdAt: Date.now()
    });

    await logAppend(STREAMS.marketplaceIndex, {
      type: 'BLUEPRINT_DEPLOYED',
      blueprintHash,
      tier,
      nodeCount: nodes.length
    });

    return NextResponse.json({ success: true, blueprintHash });
  } catch (err: any) {
    console.error('Blueprint save error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
