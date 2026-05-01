export interface MarketplaceListing {
  id: string;
  agentId: string;
  name: string;
  description: string;
  skills: string[];
  price: number;
  currency: 'USDC' | 'ETH';
  rating: number;
  completedTasks: number;
  isAI: boolean;
}

export interface HireAgentRequest {
  listingId: string;
  buyerWallet: string;
  taskDescription: string;
  budget: number;
}

export interface HireAgentResponse {
  taskId: string;
  escrowId: string;
  status: 'pending' | 'processing' | 'completed';
  estimatedCompletion?: Date;
}

export async function queryMarketplace(filters?: {
  skills?: string[];
  minRating?: number;
  isAI?: boolean;
}): Promise<MarketplaceListing[]> {
  const params = new URLSearchParams();
  if (filters?.skills) params.set('skills', filters.skills.join(','));
  if (filters?.minRating) params.set('minRating', String(filters.minRating));
  if (filters?.isAI !== undefined) params.set('isAI', String(filters.isAI));

  const response = await fetch(`/api/agents/marketplace?${params}`);
  if (!response.ok) throw new Error('Failed to query marketplace');
  return response.json();
}

export async function hireAgent(request: HireAgentRequest): Promise<HireAgentResponse> {
  const response = await fetch('/api/agents/hire', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error('Failed to hire agent');
  return response.json();
}

export async function payWithX402(
  to: string,
  amount: number,
  description: string
): Promise<{ txHash: string; status: string }> {
  const response = await fetch('/api/pay/x402', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, amount, description }),
  });
  if (!response.ok) throw new Error('Payment failed');
  return response.json();
}

export async function executeKeeperTask(
  task: string,
  params: Record<string, unknown>
): Promise<{ result: unknown; executionTime: number }> {
  const response = await fetch('/api/keeper/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, params }),
  });
  if (!response.ok) throw new Error('Keeper execution failed');
  return response.json();
}

export async function sendViaAXL(
  to: string,
  amount: number,
  asset: string
): Promise<{ txHash: string; confirmationTime: number }> {
  const response = await fetch('/api/axl/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, amount, asset }),
  });
  if (!response.ok) throw new Error('AXL transfer failed');
  return response.json();
}