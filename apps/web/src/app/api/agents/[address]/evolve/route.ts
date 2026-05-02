import { NextResponse } from 'next/server';
import { triggerSkillGeneration } from '@/lib/agents/evolution';

export async function POST(req: Request, { params }: { params: { address: string } }) {
  try {
    // In production, verify caller is agent owner
    const result = await triggerSkillGeneration(params.address);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Skill evolution failed' }, { status: 500 });
  }
}
