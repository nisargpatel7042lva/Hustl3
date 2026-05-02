import { NextResponse } from 'next/server';
import { loadAgentKVMemory } from '@/lib/agents/memory';
import { kvGet, KEYS } from '@/lib/storage/zerog';

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const memory = await loadAgentKVMemory(params.address);
    // Fetch full skill manifests if needed
    const skills = [];
    for (const skillId of Object.keys(memory.skills)) {
      const manifest = await kvGet(KEYS.agentSkill(params.address, skillId));
      if (manifest) skills.push({ id: skillId, ...manifest as any });
    }
    return NextResponse.json(skills);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agent skills' }, { status: 500 });
  }
}
