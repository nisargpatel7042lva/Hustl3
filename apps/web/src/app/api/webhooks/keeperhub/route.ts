import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { kvGet, kvSet, logAppend, KEYS, STREAMS } from '@/lib/storage/zerog';

/**
 * KeeperHub webhook payload shape.
 * Sent by KeeperHub when a job status changes (confirmed / failed).
 */
interface KeeperWebhookPayload {
  job_id: string;
  status: 'confirmed' | 'failed';
  tx_hash?: string;
  block_number?: number;
  error?: string;
  audit_ref?: string;
  confirmed_at?: string;
  metadata?: Record<string, string>;
}

/**
 * Verify the HMAC-SHA256 signature KeeperHub attaches to every webhook.
 * KeeperHub signs the raw request body with the webhook secret and sends
 * the hex digest in the `x-keeperhub-signature` header.
 */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');
  try {
    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    // Buffers differ in length — definitely not equal
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Read raw body first — HMAC must be computed over the exact bytes sent
    const rawBody = await req.text();
    const signature = req.headers.get('x-keeperhub-signature');
    const webhookSecret = process.env.KEEPERHUB_WEBHOOK_SECRET;

    // Enforce signature verification when a secret is configured
    if (webhookSecret) {
      if (!verifySignature(rawBody, signature, webhookSecret)) {
        console.warn('[KeeperHub Webhook] Invalid signature — request rejected');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      // No secret configured — warn loudly but allow through (dev/testing only)
      console.warn('[KeeperHub Webhook] KEEPERHUB_WEBHOOK_SECRET not set — skipping signature check');
    }

    const payload = JSON.parse(rawBody) as KeeperWebhookPayload;

    if (!payload.job_id || !payload.status) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { job_id, status, tx_hash, block_number, error, audit_ref, metadata } = payload;

    console.log('[KeeperHub Webhook] Received:', { job_id, status, tx_hash, metadata });

    // Route to the correct handler based on the action stored in metadata
    const action = metadata?.action;
    const orderId = metadata?.orderId;

    if (orderId && action && isOrderAction(action)) {
      await handleOrderCallback({ orderId, action, job_id, status, tx_hash, block_number, error, audit_ref });
    } else if (action === 'recordReputation') {
      console.log(`[KeeperHub Webhook] Reputation recorded on-chain for order ${metadata?.orderId}, tx: ${tx_hash}`);
    } else if (action === 'endorseAgent') {
      console.log(`[KeeperHub Webhook] Endorsement confirmed on-chain for ${metadata?.subject}, tx: ${tx_hash}`);
    } else if (action === 'updateCapabilityHash') {
      console.log(`[KeeperHub Webhook] Capability hash updated on-chain for agent ${metadata?.agentWallet}, tx: ${tx_hash}`);
    } else {
      console.log(`[KeeperHub Webhook] Unhandled action: ${action}`, metadata);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[KeeperHub Webhook] Processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function isOrderAction(action: string): action is 'releaseEscrow' | 'markDelivered' | 'raiseDispute' {
  return ['releaseEscrow', 'markDelivered', 'raiseDispute'].includes(action);
}

async function handleOrderCallback({
  orderId,
  action,
  job_id,
  status,
  tx_hash,
  block_number,
  error,
  audit_ref,
}: {
  orderId: string;
  action: 'releaseEscrow' | 'markDelivered' | 'raiseDispute';
  job_id: string;
  status: 'confirmed' | 'failed';
  tx_hash?: string;
  block_number?: number;
  error?: string;
  audit_ref?: string;
}) {
  const order = await kvGet<any>(KEYS.orderData(orderId));
  if (!order) {
    console.error(`[KeeperHub Webhook] Order not found: ${orderId}`);
    return;
  }

  if (status === 'confirmed') {
    order.onChainConfirmed = true;
    order.txHash = tx_hash;
    order.blockNumber = block_number;
    order.auditRef = audit_ref;
    order.history.push({
      state: `${order.state}_ONCHAIN`,
      timestamp: Date.now(),
      txHash: tx_hash,
      blockNumber: block_number,
    });
    console.log(`[KeeperHub Webhook] Order ${orderId} — ${action} confirmed on-chain. tx: ${tx_hash}`);
  } else {
    order.keeperJobFailed = true;
    order.keeperJobError = error || 'Unknown KeeperHub error';
    order.history.push({
      state: 'KEEPER_JOB_FAILED',
      timestamp: Date.now(),
      jobId: job_id,
      action,
      error: error || 'Unknown error',
      auditRef: audit_ref,
    });
    console.error(`[KeeperHub Webhook] Order ${orderId} — ${action} FAILED. jobId: ${job_id}, error: ${error}`);
  }

  await kvSet(KEYS.orderData(orderId), order);

  await logAppend(STREAMS.orderEvents(orderId), {
    type: status === 'confirmed' ? 'KEEPER_JOB_CONFIRMED' : 'KEEPER_JOB_FAILED',
    jobId: job_id,
    action,
    txHash: tx_hash,
    blockNumber: block_number,
    error,
    auditRef: audit_ref,
    timestamp: Date.now(),
  });
}
