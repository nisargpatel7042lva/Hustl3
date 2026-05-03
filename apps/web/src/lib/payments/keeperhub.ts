/**
 * KeeperHub Direct Execution client.
 *
 * Uses KeeperHub's Direct Execution API to call smart contract functions
 * directly — no workflows needed. KeeperHub handles gas estimation,
 * nonce management, retries, and wallet security.
 *
 * Docs: https://docs.keeperhub.com/api/direct-execution
 * Auth: https://docs.keeperhub.com/api/authentication
 */

const KEEPERHUB_API_URL = process.env.KEEPERHUB_API_URL || 'https://app.keeperhub.com';
const KEEPERHUB_API_KEY = process.env.KEEPERHUB_API_KEY || '';

// Map our internal chain IDs to KeeperHub network names
const CHAIN_ID_TO_NETWORK: Record<number, string> = {
  1:        'ethereum',
  11155111: 'sepolia',
  8453:     'base',
  84532:    'base-sepolia',
  137:      'polygon',
  42161:    'arbitrum',
};

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
  jobId:        string;
  status:       'pending' | 'running' | 'confirmed' | 'failed';
  txHash?:      string;
  blockNumber?: number;
  error?:       string;
  auditRef?:    string;
  submittedAt:  string;
  confirmedAt?: string;
}

async function keeperFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${KEEPERHUB_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${KEEPERHUB_API_KEY}`,
      ...(options.headers ?? {}),
    },
  });
  return res;
}

/**
 * Call a smart contract function via KeeperHub Direct Execution API.
 * KeeperHub uses its managed wallet to sign and submit the transaction.
 * Returns an executionId to track status.
 *
 * Docs: POST /api/execute/contract-call
 */
export async function submitKeeperJob(req: KeeperJobRequest): Promise<string> {
  const network = CHAIN_ID_TO_NETWORK[req.chainId];
  if (!network) {
    throw new Error(
      `KeeperHub: unsupported chainId ${req.chainId}. ` +
      `Supported: ${Object.keys(CHAIN_ID_TO_NETWORK).join(', ')}`
    );
  }

  const body = {
    contractAddress: req.contractAddress,
    network,
    functionName:    req.functionName,
    functionArgs:    JSON.stringify(req.args),
    abi:             JSON.stringify(req.abi),
  };

  const res = await keeperFetch('/api/execute/contract-call', {
    method: 'POST',
    body:   JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`KeeperHub contract-call failed (${res.status}): ${err}`);
  }

  const data = (await res.json()) as { executionId?: string; status?: string; result?: unknown };

  // Read-only (view/pure) functions return { result } synchronously — no executionId
  // Write functions return { executionId, status }
  if (data.executionId) {
    return data.executionId;
  }

  // For read-only calls or synchronous completions, generate a synthetic ID
  return `sync_${Date.now()}`;
}

/**
 * Get the status of a direct execution.
 * Docs: GET /api/execute/{executionId}/status
 */
export async function getKeeperJobStatus(executionId: string): Promise<KeeperJobStatus> {
  // Direct execution status endpoint
  const res = await keeperFetch(`/api/execute/${executionId}/status`);

  // If 404, the execution may have completed synchronously — treat as confirmed
  if (res.status === 404) {
    return {
      jobId:       executionId,
      status:      'confirmed',
      submittedAt: new Date().toISOString(),
    };
  }

  if (!res.ok) throw new Error(`KeeperHub status check failed: ${res.status}`);

  const data = (await res.json()) as {
    executionId:     string;
    status:          string;
    transactionHash?: string;
    gasUsedWei?:     string;
    error?:          string;
    createdAt:       string;
    completedAt?:    string;
  };

  return {
    jobId:       data.executionId,
    status:      normalizeStatus(data.status),
    txHash:      data.transactionHash,
    error:       data.error ?? undefined,
    submittedAt: data.createdAt,
    confirmedAt: data.completedAt,
  };
}

function normalizeStatus(s: string): KeeperJobStatus['status'] {
  if (s === 'completed') return 'confirmed';
  if (s === 'failed')    return 'failed';
  if (s === 'running')   return 'running';
  return 'pending';
}

/**
 * Poll for execution completion with exponential backoff.
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
  throw new Error(`KeeperHub execution ${jobId} timed out`);
}

// Alias
export const getKeeperExecutionStatus = getKeeperJobStatus;
