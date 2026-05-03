/**
 * 0G Compute integration.
 * Supports qwen3.6-plus (complex reasoning) and GLM-5-FP8 (fast generation).
 * Uses sealed inference to keep system prompts private.
 */

import OpenAI from 'openai';

export type ComputeModel = 'qwen3.6-plus' | 'GLM-5-FP8';

export interface ComputeRequest {
  model: ComputeModel;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  sealed?: boolean; // sealed inference — hides system prompt from nodes
}

export interface ComputeResponse {
  id: string;
  model: ComputeModel;
  content: string;
  promptTokens: number;
  outputTokens: number;
  totalCost: string;
  latencyMs: number;
}

const ZEROG_COMPUTE_ENDPOINT = process.env.ZEROG_COMPUTE_ENDPOINT || 'http://localhost:6791';
const ZEROG_COMPUTE_KEY = process.env.ZEROG_COMPUTE_KEY || '';

export async function computeInfer(
  req: ComputeRequest,
  retries = 3,
): Promise<ComputeResponse> {
  const body = {
    model: req.model,
    messages: [
      { role: 'system', content: req.systemPrompt },
      { role: 'user', content: req.userPrompt },
    ],
    max_tokens: req.maxTokens ?? 4096,
    temperature: req.temperature ?? 0.7,
    sealed: req.sealed ?? true,
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const start = Date.now();
      const res = await fetch(`${ZEROG_COMPUTE_ENDPOINT}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        id: data.id,
        model: req.model,
        content: data.choices[0]?.message?.content ?? '',
        promptTokens: data.usage?.prompt_tokens ?? 0,
        outputTokens: data.usage?.completion_tokens ?? 0,
        totalCost: '0', // billed separately via 0G token
        latencyMs: Date.now() - start,
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
  const groqKey = process.env.GROQ_API_KEY;
  
  console.log('--- ATTEMPTING GROQ FALLBACK ---', !!groqKey);
  if (groqKey) {
    try {
      console.log('Executing Groq request...');
      const start = Date.now();
      
      // Bypass Next.js fetch polyfill by using raw Node.js https
      // This prevents "fetch failed / AbortError" when running asynchronously after the response ends.
      const https = require('https');
      const completion = await new Promise<any>((resolve, reject) => {
        const bodyStr = JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: 'system', content: req.systemPrompt },
            { role: 'user', content: req.userPrompt }
          ]
        });
        
        const request = https.request('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`,
            'Content-Length': Buffer.byteLength(bodyStr)
          }
        }, (res: any) => {
          let data = '';
          res.on('data', (chunk: any) => data += chunk);
          res.on('end', () => {
            if (res.statusCode >= 400) {
              reject(new Error(`Groq HTTP ${res.statusCode}: ${data}`));
            } else {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(e);
              }
            }
          });
        });
        request.on('error', reject);
        request.write(bodyStr);
        request.end();
      });
      
      console.log('--- GROQ SUCCESS ---');
      return {
        id: completion.id,
        model: req.model,
        content: completion.choices[0].message.content || '',
        promptTokens: completion.usage?.prompt_tokens || 0,
        outputTokens: completion.usage?.completion_tokens || 0,
        totalCost: '0',
        latencyMs: Date.now() - start
      };
    } catch (groqErr: any) {
      console.error('Groq fallback FATAL error:', groqErr.message, groqErr.stack);
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
