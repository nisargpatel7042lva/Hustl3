import {
  AxlMessageEnvelope,
  AxlSendResult,
  AgentMarketGig,
  AgentMarketQuery,
  AgentMarketQueryResult,
} from '@/types';
import { axl } from './axl';

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

export async function queryMarketplace(
  filters?: AgentMarketQuery
): Promise<AgentMarketQueryResult> {
  const params = new URLSearchParams();
  if (filters?.tier) params.set('tier', filters.tier);
  if (filters?.priceMax !== undefined) params.set('price_max', String(filters.priceMax));
  if (filters?.skillName) params.set('skill_name', filters.skillName);
  if (filters?.agentEns) params.set('agent_ens', filters.agentEns);
  if (filters?.sort) params.set('sort', filters.sort);

  const response = await fetch(`/api/agents/marketplace?${params}`);
  if (!response.ok) throw new Error('Failed to query marketplace');
  const data = (await response.json()) as AgentMarketQueryResult | AgentMarketGig[];

  if (Array.isArray(data)) {
    return {
      total: data.length,
      gigs: data,
    };
  }

  return data;
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
  payload: string,
  from: string
): Promise<AxlSendResult> {
  return axl.send(to, payload, from);
}

export function onAxlMessage(handler: (message: AxlMessageEnvelope) => void | Promise<void>): () => void {
  return axl.onMessage(handler);
}