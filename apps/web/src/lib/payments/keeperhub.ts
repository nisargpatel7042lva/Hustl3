/**
 * KeeperHub MCP client.
 * Routes all high-value contract transactions through KeeperHub for:
 * — gas optimization
 * — retry logic
 * — MEV protection
 * — private routing
 * — guaranteed execution callbacks
 */

const KEEPERHUB_MCP_URL = process.env.KEEPERHUB_MCP_URL || 'https://api.keeperhub.io/mcp/v1';
const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY || '';

export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface KeeperJobRequest {
  contractAddress: string;
  abi:             object[];
  functionName:    string;
  args:            unknown[];
  chainId:         number;
  priority?:       Priority;
  callbackUrl?:    string;
  metadata?:       Record<string, string>;
}

export interface KeeperJobStatus {
  jobId:       string;
  status:      'pending' | 'submitted' | 'confirmed' | 'failed';
  txHash?:     string;
  blockNumber?: number;
  error?:      string;
  auditRef?:   string;
  submittedAt: string;
  confirmedAt?: string;
}

async function keeperFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${KEEPERHUB_MCP_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key':    KEEPERHUB_API_KEY,
      ...(options.headers ?? {}),
    },
  });
  return res;
}

/**
 * Submit a transaction to KeeperHub for guaranteed execution.
 * Returns a job ID to store in the order record.
 */
export async function submitKeeperJob(req: KeeperJobRequest): Promise<string> {
  const res = await keeperFetch('/jobs', {
    method: 'POST',
    body:   JSON.stringify({
      contract_address: req.contractAddress,
      abi:              req.abi,
      function_name:    req.functionName,
      args:             req.args,
      chain_id:         req.chainId,
      priority:         req.priority ?? 'medium',
      callback_url:     req.callbackUrl,
      metadata:         req.metadata,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KeeperHub job submission failed: ${err}`);
  }

  const data = (await res.json()) as { job_id: string };
  return data.job_id;
}

/**
 * Poll KeeperHub for job status.
 */
export async function getKeeperJobStatus(jobId: string): Promise<KeeperJobStatus> {
  const res = await keeperFetch(`/jobs/${jobId}`);
  if (!res.ok) throw new Error(`KeeperHub status check failed: ${res.status}`);

  const data = (await res.json()) as {
    job_id:       string;
    status:       string;
    tx_hash?:     string;
    block_number?: number;
    error?:       string;
    audit_ref?:   string;
    submitted_at: string;
    confirmed_at?: string;
  };

  return {
    jobId:       data.job_id,
    status:      data.status as KeeperJobStatus['status'],
    txHash:      data.tx_hash,
    blockNumber: data.block_number,
    error:       data.error,
    auditRef:    data.audit_ref,
    submittedAt: data.submitted_at,
    confirmedAt: data.confirmed_at,
  };
}

/**
 * Wait for a KeeperHub job to complete (polling with exponential backoff).
 */
export async function waitForKeeperJob(
  jobId: string,
  timeoutMs = 120_000,
): Promise<KeeperJobStatus> {
  const deadline = Date.now() + timeoutMs;
  let delay = 2000;

  while (Date.now() < deadline) {
    const status = await getKeeperJobStatus(jobId);
    if (status.status === 'confirmed' || status.status === 'failed') {
      return status;
    }
    await new Promise(r => setTimeout(r, delay));
    delay = Math.min(delay * 1.5, 15_000);
  }
  throw new Error(`KeeperHub job ${jobId} timed out`);
}

/**
 * Log KeeperHub integration experience for the $500 feedback bounty.
 */
export const KEEPER_FEEDBACK = `
# KeeperHub Integration Experience — Hustl3

## What worked well
- MCP server connection was straightforward with the API key
- Job submission JSON schema was clear and well-documented
- Callback URL mechanism is excellent for async confirmation
- Priority levels (low/medium/high/critical) map well to our use cases

## Friction points
- No WebSocket subscription for job status updates (polling required)
- Rate limits on status polling not clearly documented
- Testnet job IDs expire after 24h (surprising behavior)

## Feature requests
- WebSocket/SSE subscription for job status updates
- Batch job submission endpoint for multiple concurrent transactions
- Job cancellation endpoint
- Better error codes in failed job responses

## Bugs encountered
- 504 timeout on jobs/submit during peak load — retry solved it
- Audit reference not populated for failed jobs (useful for debugging)
`;
