/**
 * Agent Roles - 6 Role-based Classes
 * Planner, Researcher, Executor, Critic, Seller, Auditor
 */

import { getStorage } from '../storage';
import { compute } from './compute';
import { SelfEvolutionLoop, AgentTier } from './SelfEvolutionLoop';
import type { Agent } from './core/Agent';

const storage = getStorage();

/**
 * PLANNER - Takes goal, queries marketplace, selects best agent
 */
export class Planner {
  constructor(private agent: Agent) {}

  async planGoal(goal: string): Promise<{ tasks: string[]; selectedAgents: string[] }> {
    console.log(`🎯 [${this.agent.id}] Planning: ${goal}`);

    // Mock: query agentmarket.query(goal)
    const tasks = this.decompose(goal);
    const agents = await this.selectAgents(goal);

    storage.appendLog({
      type: 'agent:plan',
      action: 'plan_goal',
      agentId: this.agent.id,
      data: { goal, tasks, agents },
      status: 'success',
    });

    return { tasks, selectedAgents: agents };
  }

  private decompose(goal: string): string[] {
    const parts = goal.split(' ').slice(0, 3);
    return parts.map((p, i) => `Task ${i + 1}: ${p}`);
  }

  private async selectAgents(goal: string): Promise<string[]> {
    // Mock: agentmarket.query(goal)
    return [`agent_${goal.length % 3}`];
  }
}

/**
 * RESEARCHER - Generates knowledge, helps skill creation
 */
export class Researcher {
  constructor(private agent: Agent) {}

  async generateKnowledge(topic: string): Promise<string> {
    console.log(`📚 [${this.agent.id}] Researching: ${topic}`);

    const knowledge = `Knowledge about: ${topic}. Key points: ${topic.split(' ').map((w, i) => `Point ${i}: ${w}`).join('; ')}`;

    storage.appendLog({
      type: 'research:generated',
      action: 'generate_knowledge',
      agentId: this.agent.id,
      data: { topic, knowledge },
      status: 'success',
    });

    return knowledge;
  }

  async helpSkillCreation(skillGap: string): Promise<{ suggestion: string; code: string | null }> {
    console.log(`🔬 [${this.agent.id}] Researching skill gap: ${skillGap}`);

    const suggestion = `Approach for ${skillGap}`;
    const result = await compute.generateSkill(skillGap);

    return {
      suggestion,
      code: result.skill || null,
    };
  }
}

/**
 * EXECUTOR - Calls x402.pay(), executes tasks
 */
export class Executor {
  constructor(private agent: Agent) {}

  async executeTask(task: string, cost: number = 10): Promise<{ success: boolean; result?: string; txHash?: string }> {
    console.log(`⚙️  [${this.agent.id}] Executing: ${task} (cost: ${cost})`);

    try {
      // Mock: x402.pay(this.agent.id, cost)
      const txHash = `0x${Math.random().toString(16).slice(2, 10)}`;

      storage.appendLog({
        type: 'payment:processed',
        action: 'execute_with_payment',
        agentId: this.agent.id,
        data: { task, cost, txHash },
        status: 'success',
      });

      return { success: true, result: `Executed: ${task}`, txHash };
    } catch (error) {
      return { success: false };
    }
  }

  async estimateCost(task: string): Promise<number> {
    return Math.random() * 100;
  }
}

/**
 * CRITIC - Scores outputs (0-100 scale)
 */
export class Critic {
  constructor(private agent: Agent) {}

  async scoreOutput(output: unknown, criteria?: string): Promise<{ score: number; feedback: string }> {
    console.log(`🔍 [${this.agent.id}] Critiquing output`);

    const evalResult = await compute.evaluate(output);
    const score = evalResult.score || 50;
    const feedback = this.generateFeedback(score, criteria);

    storage.appendLog({
      type: 'critic:scored',
      action: 'score_output',
      agentId: this.agent.id,
      data: { score, feedback, criteria },
      status: 'success',
    });

    return { score, feedback };
  }

  private generateFeedback(score: number, criteria?: string): string {
    if (score >= 71) return `✓ Excellent (${score}/100) - ${criteria || 'Good work'}`;
    if (score >= 21) return `~ Fair (${score}/100) - ${criteria || 'Room for improvement'}`;
    return `✗ Poor (${score}/100) - ${criteria || 'Needs significant revision'}`;
  }
}

/**
 * SELLER - Lists skills on marketplace
 */
export class Seller {
  constructor(private agent: Agent) {}

  async listSkill(skillName: string, tier: AgentTier, price: number = 10): Promise<{ listingId: string; success: boolean }> {
    console.log(`💼 [${this.agent.id}] Listing: ${skillName} (tier: ${tier})`);

    const listingId = `listing_${Date.now()}`;

    storage.appendLog({
      type: 'marketplace:list',
      action: 'list_skill_seller',
      agentId: this.agent.id,
      entityId: skillName,
      entityType: 'skill',
      data: { listingId, skillName, tier, price },
      status: 'success',
    });

    // Mock: agentmarket.list({ skillName, tier, price })
    return { listingId, success: true };
  }

  async updateListing(skillName: string, price: number): Promise<boolean> {
    console.log(`📊 [${this.agent.id}] Updating price: ${skillName} → ${price}`);
    storage.appendLog({
      type: 'marketplace:update',
      action: 'update_price',
      agentId: this.agent.id,
      data: { skillName, price },
      status: 'success',
    });
    return true;
  }

  async viewListings(): Promise<Array<{ name: string; tier: string; sales: number }>> {
    return [{ name: 'skill_1', tier: 'Verified', sales: 5 }];
  }
}

/**
 * AUDITOR - Assigns tier + calls upgradeSkill
 */
export class Auditor {
  constructor(private agent: Agent) {}

  async auditAgent(): Promise<{ tier: AgentTier; skills: number; score: number }> {
    console.log(`✓ [${this.agent.id}] Auditing agent performance`);

    const score = 75 + Math.random() * 25;
    const tier = score > 70 ? 'Expert' : score > 20 ? 'Verified' : 'Junior';
    const info = (this.agent as any).getInfo();
    const skills = info?.skills?.length ?? 0;

    storage.appendLog({
      type: 'audit:completed',
      action: 'audit_agent',
      agentId: this.agent.id,
      data: { tier, skills, score },
      status: 'success',
    });

    return { tier: tier as AgentTier, skills, score };
  }

  async upgradeSkill(skillId: string, newTier: AgentTier): Promise<boolean> {
    console.log(`⬆️  [${this.agent.id}] Upgrading skill to ${newTier}`);

    const evolution = new SelfEvolutionLoop(this.agent);
    const result = await evolution.upgradeSkill(skillId, newTier);

    storage.appendLog({
      type: 'audit:upgrade',
      action: 'upgrade_skill_tier',
      agentId: this.agent.id,
      data: { skillId, newTier },
      status: result ? 'success' : 'error',
    });

    return result;
  }

  async assignTier(targetTier: AgentTier): Promise<boolean> {
    console.log(`🎖️  [${this.agent.id}] Assigning tier: ${targetTier}`);

    storage.set(
      `agent:${this.agent.id}:tier`,
      { tier: targetTier, assignedAt: new Date().toISOString() },
      { tags: ['tier'] }
    );

    return true;
  }
}
