import { deepInfer } from '@/lib/compute/zerog-compute';
import { loadAgentKVMemory, appendAgentLog, LogEntryType } from './memory';
import { logGetLast, kvSet, KEYS, STREAMS } from '@/lib/storage/zerog';
import { submitKeeperJob } from '@/lib/payments/keeperhub';
import { v4 as uuidv4 } from 'uuid';

export interface SkillManifest {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  recommendedModel: string;
  estimatedExecutionSeconds: number;
  suggestedPriceUSDC: number;
}

/**
 * Triggers the self-evolution flow for an agent to generate a new skill.
 */
export async function triggerSkillGeneration(agentWallet: string) {
  // 1. Load memory
  const memory = await loadAgentKVMemory(agentWallet);
  
  // Load episodic memory (Log) - recent tasks
  const streamId = STREAMS.agentActivity(agentWallet);
  const recentLogs = await logGetLast<any>(streamId, 50);
  
  // 2. Compute Meta-Prompt
  const systemPrompt = `
    You are the meta-cognition module of an AI agent on Hustl3.
    Your task is to analyze the agent's recent history and generate a NEW specialized skill.
    Identify patterns in what buyers have requested that the agent doesn't explicitly offer yet.
    Output MUST be valid JSON matching this schema:
    {
      "name": "Short skill name",
      "description": "Clear description of the capability",
      "inputSchema": {}, // JSON schema for required inputs
      "outputSchema": {}, // JSON schema for outputs
      "recommendedModel": "qwen3.6-plus or GLM-5-FP8",
      "estimatedExecutionSeconds": 30,
      "suggestedPriceUSDC": 1.5
    }
  `;

  const userPrompt = `
    Agent Current Skills: ${JSON.stringify(memory.skills)}
    Recent Activity Logs: ${JSON.stringify(recentLogs.map(l => l.data))}
    
    Generate a new skill manifest as JSON.
  `;

  // 3. Generate Skill via 0G Compute
  const result = await deepInfer(systemPrompt, userPrompt);
  
  // Extract JSON (handle potential markdown formatting from LLM)
  let rawJson = result.content;
  if (rawJson.includes('```json')) {
    rawJson = rawJson.split('```json')[1].split('```')[0].trim();
  } else if (rawJson.includes('```')) {
    rawJson = rawJson.split('```')[1].split('```')[0].trim();
  }
  
  const skillManifest = JSON.parse(rawJson) as SkillManifest;
  
  // 4. Store skill manifest in 0G Storage
  const skillId = uuidv4();
  const skillKey = KEYS.agentSkill(agentWallet, skillId);
  await kvSet(skillKey, skillManifest);
  
  // Update Agent's KV memory to include new skill
  memory.skills[skillId] = skillManifest.name;
  await kvSet(KEYS.agentMemory(agentWallet), memory);

  // 5. Create new Gig in Marketplace
  const gigId = uuidv4();
  const gigKey = KEYS.gigData(gigId);
  await kvSet(gigKey, {
    gigId,
    sellerWallet: agentWallet,
    sellerType: 'agent',
    title: skillManifest.name,
    description: skillManifest.description,
    price: skillManifest.suggestedPriceUSDC,
    deliveryTimeHours: Math.ceil(skillManifest.estimatedExecutionSeconds / 3600),
    skillManifestKey: skillKey,
    createdAt: Date.now()
  });
  
  // 6. Update on-chain Registry via KeeperHub (update capability hash)
  // Simplified capability hash generation (in production use a real content hash)
  const capabilityHash = '0x' + Buffer.from(skillId.replace(/-/g, '')).toString('hex').padEnd(64, '0');
  
  await submitKeeperJob({
    contractAddress: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || '',
    abi: [{"inputs":[{"internalType":"address","name":"agentWallet","type":"address"},{"internalType":"bytes32","name":"newHash","type":"bytes32"}],"name":"updateCapabilityHash","outputs":[],"stateMutability":"nonpayable","type":"function"}],
    functionName: 'updateCapabilityHash',
    args: [agentWallet, capabilityHash],
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '16600'),
    priority: 'medium',
    callbackUrl: `${process.env.APP_URL}/api/webhooks/keeperhub`,
    metadata: { action: 'updateCapabilityHash', agentWallet, skillId }
  });

  // 7. Append to Log
  await appendAgentLog(agentWallet, {
    type: LogEntryType.SKILL_GENERATED,
    payload: {
      skillId,
      gigId,
      name: skillManifest.name
    },
    references: [skillKey, gigKey]
  });
  
  return { success: true, skillId, gigId, skillName: skillManifest.name };
}
