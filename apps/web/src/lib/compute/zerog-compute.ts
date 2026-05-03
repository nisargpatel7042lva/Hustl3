/**
 * 0G Compute integration.
 * Supports qwen3.6-plus (complex reasoning) and GLM-5-FP8 (fast generation).
 * Uses sealed inference to keep system prompts private.
 */

import OpenAI from 'openai';

export type ComputeModel = 'qwen3.6-plus' | 'GLM-5-FP8';

export interface ComputeRequest {
  model:        ComputeModel;
  systemPrompt: string;
  userPrompt:   string;
  maxTokens?:   number;
  temperature?: number;
  sealed?:      boolean; // sealed inference — hides system prompt from nodes
}

export interface ComputeResponse {
  id:            string;
  model:         ComputeModel;
  content:       string;
  promptTokens:  number;
  outputTokens:  number;
  totalCost:     string;
  latencyMs:     number;
}

const ZEROG_COMPUTE_ENDPOINT = process.env.ZEROG_COMPUTE_ENDPOINT || 'http://localhost:6791';
const ZEROG_COMPUTE_KEY      = process.env.ZEROG_COMPUTE_KEY      || '';

export async function computeInfer(
  req: ComputeRequest,
  retries = 3,
): Promise<ComputeResponse> {
  const body = {
    model:       req.model,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user',   content: req.userPrompt },
    ],
    max_tokens:  req.maxTokens  ?? 4096,
    temperature: req.temperature ?? 0.7,
    sealed:      req.sealed ?? true,
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const start = Date.now();
      const res = await fetch(`${ZEROG_COMPUTE_ENDPOINT}/v1/chat/completions`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization: `Bearer ${ZEROG_COMPUTE_KEY}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120_000), // 2 minute timeout
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`0G Compute error ${res.status}: ${errText}`);
      }

      const data = (await res.json()) as {
        id: string;
        choices: Array<{ message: { content: string } }>;
        usage: { prompt_tokens: number; completion_tokens: number };
        model: string;
      };

      return {
        id:           data.id,
        model:        req.model,
        content:      data.choices[0]?.message?.content ?? '',
        promptTokens: data.usage?.prompt_tokens  ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalCost:    '0', // billed separately via 0G token
        latencyMs:    Date.now() - start,
      };
    } catch (err) {
      lastErr = err;
      if (attempt < retries - 1) {
        await new Promise(r => setTimeout(r, 2000 * 2 ** attempt));
      }
    }
  }

  console.warn('0G Compute failed, falling back to external AI provider...', lastErr);
  
  // 1. Try Groq (Free & Fast)
  if (process.env.GROQ_API_KEY) {
    try {
      const openai = new OpenAI({ 
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      const start = Date.now();
      const completion = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userPrompt }
        ],
      });
      return {
        id: completion.id,
        model: req.model,
        content: completion.choices[0].message.content || '',
        promptTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalCost: '0',
        latencyMs: Date.now() - start
      };
    } catch (groqErr) {
      console.error('Groq fallback failed:', groqErr);
    }
  }

  // 2. Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const start = Date.now();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userPrompt }
        ],
      });
      return {
        id: completion.id,
        model: req.model,
        content: completion.choices[0].message.content || '',
        promptTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalCost: '0',
        latencyMs: Date.now() - start
      };
    } catch (openAiErr) {
      console.error('OpenAI fallback failed:', openAiErr);
    }
  }

  return {
    id: `err_${Date.now()}`,
    model: req.model,
    content: "Error: No API endpoints available. Please add GROQ_API_KEY to your .env.local file.",
    promptTokens: 0,
    outputTokens: 0,
    totalCost: '0',
    latencyMs: 0
  };
}

/**
 * Quick inference using GLM-5-FP8 for fast generation tasks.
 */
export function fastInfer(systemPrompt: string, userPrompt: string) {
  return computeInfer({ model: 'GLM-5-FP8', systemPrompt, userPrompt });
}

/**
 * Deep reasoning using qwen3.6-plus for complex analytical tasks.
 */
export function deepInfer(systemPrompt: string, userPrompt: string, maxTokens = 8192) {
  return computeInfer({ model: 'qwen3.6-plus', systemPrompt, userPrompt, maxTokens, sealed: true });
}

export async function executeComputeTask(prompt: string, options?: { model?: string, temperature?: number }): Promise<string> {
  const req: ComputeRequest = {
    model: (options?.model as ComputeModel) || 'qwen3.6-plus',
    systemPrompt: 'You are an intelligent AI agent executing a task.',
    userPrompt: prompt,
    temperature: options?.temperature
  };
  const response = await computeInfer(req);
  return response.content;
}
