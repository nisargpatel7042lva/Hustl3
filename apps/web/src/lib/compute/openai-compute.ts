/**
 * 0G Compute — Decentralized GPU Marketplace via OpenAI SDK Compatible API
 */
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export type ComputeModel = 'qwen3.6-plus' | 'GLM-5-FP8';

const ZEROG_COMPUTE_ENDPOINT = process.env.ZEROG_COMPUTE_ENDPOINT || 'https://compute-testnet.0g.ai';
const ZEROG_COMPUTE_KEY = process.env.ZEROG_COMPUTE_KEY || '';

let _client: OpenAI | null = null;
export function getComputeClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: ZEROG_COMPUTE_KEY || 'zerog-compute',
      baseURL: `${ZEROG_COMPUTE_ENDPOINT}/v1`,
      defaultHeaders: { 'X-0G-Network': 'compute' },
      timeout: 120000,
    });
  }
  return _client;
}

export async function computeInferOpenAI(
  model: ComputeModel,
  systemPrompt: string,
  userPrompt: string,
  sealed: boolean = false
) {
  const client = getComputeClient();
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const completion = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 4096,
    temperature: 0.7,
    // 0G-specific TEE sealed inference
    // @ts-ignore
    sealed: sealed
  });

  return {
    id: completion.id,
    content: completion.choices[0]?.message?.content || '',
    promptTokens: completion.usage?.prompt_tokens || 0,
    outputTokens: completion.usage?.completion_tokens || 0,
  };
}

// TEE-sealed inference — confidential execution with attestation
export async function sealedInfer(systemPrompt: string, userPrompt: string) {
  return computeInferOpenAI('qwen3.6-plus', systemPrompt, userPrompt, true);
}
