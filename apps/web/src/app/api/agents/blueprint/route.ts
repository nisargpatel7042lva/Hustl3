import { NextRequest, NextResponse } from 'next/server';
import { kvSet, kvGet, logAppend, STREAMS } from '@/lib/storage/zerog';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blueprint, ownerWallet, onChainTxHash, registrationFee, status } = body;

    // Support both old { nodes, edges } and new { blueprint } formats
    const nodes = blueprint?.nodes ?? body.nodes;
    const edges = blueprint?.edges ?? body.edges;
    const name  = blueprint?.name ?? body.name ?? 'Agent Team Blueprint';
    const tier  = blueprint?.tier ?? body.tier ?? 3;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'Empty blueprint' }, { status: 400 });
    }
    if (!ownerWallet) {
      return NextResponse.json({ error: 'ownerWallet is required' }, { status: 400 });
    }

    // Deterministic ID from blueprint content
    const blueprintString = JSON.stringify({ nodes, edges });
    const blueprintId     = body.blueprintId ?? ('bp_' + crypto.createHash('sha256').update(blueprintString).digest('hex').slice(0, 16));

    const record = {
      blueprintId,
      ownerWallet,
      name,
      tier,
      nodes,
      edges,
      onChainTxHash:   onChainTxHash   ?? null,
      registrationFee: registrationFee ?? null,
      status:          status          ?? 'pending',
      createdAt:       Date.now(),
    };

    // Store in 0G KV under owner and by ID
    await kvSet(`blueprint:${blueprintId}`,                 record);
    await kvSet(`agent-blueprints:${ownerWallet.toLowerCase()}:${blueprintId}`, record);

    await logAppend(STREAMS.marketplaceIndex, {
      type:        'BLUEPRINT_DEPLOYED',
      blueprintId,
      ownerWallet,
      onChainTxHash,
      nodeCount:   nodes.length,
    });

    return NextResponse.json({ success: true, blueprintId, blueprintHash: blueprintId });
  } catch (err: any) {
    console.error('Blueprint save error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get('owner');
    const id    = searchParams.get('id');

    if (id) {
      const record = await kvGet<any>(`blueprint:${id}`);
      if (!record) return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
      return NextResponse.json(record);
    }

    // List owner's blueprints (future expansion)
    return NextResponse.json([]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
