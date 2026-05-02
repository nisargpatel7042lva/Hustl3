/**
 * Self-Evolution Loop - Agent Auto-Skill Generation
 * Critic → Score → Skill Gap → Generate → Store → List
 */

import { getStorage } from '../storage';
import { compute } from './compute';
import type { Agent } from './core/Agent';

export interface SkillTierRequest {
  agentId: string;
  skillCode: string;
  skillGap: string;
  score: number;
  tier: AgentTier;
}

export type AgentTier = 'Junior' | 'Verified' | 'Expert';

const TIERS: Record<string, { min: number; max: number; tier: AgentTier }> = {
  Junior: { min: 0, max: 20, tier: 'Junior' },
  Verified: { min: 21, max: 70, tier: 'Verified' },
  Expert: { min: 71, max: 100, tier: 'Expert' },
};

export class SelfEvolutionLoop {
  private storage = getStorage();
  private threshold = 70;

  constructor(private agent: Agent) {}

  async evolveFromResult(result: unknown): Promise<boolean> {
    const evalResult = await compute.evaluate(result);
    const score = evalResult.score ?? 50;

    this.log(`📊 Evaluated result: score=${score}`);

    if (score < this.threshold) {
      return this.generateAndStoreSkill(score, result);
    }

    this.log(`✓ Score ${score} >= threshold ${this.threshold}`);
    return false;
  }

  private async generateAndStoreSkill(score: number, failureContext: unknown): Promise<boolean> {
    const tier = this.getTierFromScore(score);
    const skillGap = this.createSkillGap(score, failureContext);

    this.log(`🔧 Tier: ${tier} | Gap: ${skillGap}`);

    const genResult = await compute.generateSkill(skillGap);
    if (!genResult.success || !genResult.skill) {
      this.log(`❌ Generation failed (${genResult.attempts} attempts)`);
      return false;
    }

    this.log(`✓ Generated skill`);

    const skillId = `skill_${Date.now()}`;
    this.storage.set(
      `skill:${this.agent.id}:${skillId}`,
      { code: genResult.skill, gap: skillGap, generatedAt: new Date().toISOString(), score, tier },
      { encrypt: true, tags: ['auto-generated', tier.toLowerCase()] }
    );

    this.agent.addNewSkill({ id: skillId, name: skillId, description: skillGap, trained: true } as any);
    this.log(`💾 Stored skill: ${skillId}`);

    await this.listSkillOnMarketplace(skillId, tier, skillGap);
    return true;
  }

  private createSkillGap(score: number, context: unknown): string {
    if (typeof context === 'string') return context.substring(0, 50);
    if (typeof context === 'object') return `Handle: ${Object.keys(context || {}).slice(0, 3).join(', ')}`;
    return `General improvement needed`;
  }

  private getTierFromScore(score: number): AgentTier {
    if (score <= 20) return 'Junior';
    if (score <= 70) return 'Verified';
    return 'Expert';
  }

  private async listSkillOnMarketplace(skillId: string, tier: AgentTier, description: string): Promise<void> {
    this.storage.appendLog({
      type: 'marketplace:list',
      action: 'list_skill',
      agentId: this.agent.id,
      entityId: skillId,
      entityType: 'skill',
      data: { skillId, tier, description },
      status: 'success',
    });
    this.log(`→ Listed as ${tier}`);
  }

  async upgradeSkill(skillId: string, newTier: AgentTier): Promise<boolean> {
    const key = `skill:${this.agent.id}:${skillId}`;
    const skill = this.storage.get<Record<string, unknown>>(key);
    if (!skill) return false;
    this.storage.set(key, { ...skill, tier: newTier, upgradedAt: new Date().toISOString() }, { encrypt: true });
    this.log(`⬆️  Upgraded to ${newTier}`);
    return true;
  }

  private log(message: string): void {
    console.log(message);
    this.storage.appendLog({
      type: 'agent:evolution',
      action: 'evolution_step',
      agentId: this.agent.id,
      data: { message },
      status: 'success',
    });
  }
}