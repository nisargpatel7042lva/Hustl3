/**
 * Agent Manager - Orchestrates multiple agents
 */

import type { Goal, AgentSkill } from './types';
import { Agent, type AgentConfig } from './Agent';
import { EventBus } from './EventBus';

/**
 * Manages a group of agents and coordinates their activities
 */
export class AgentManager {
  private agents = new Map<string, Agent>();
  private eventBus: EventBus;

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus ?? new EventBus();
  }

  /**
   * Create and register a new agent
   */
  createAgent(config: Omit<AgentConfig, 'eventBus'>): Agent {
    if (this.agents.has(config.id)) {
      throw new Error(`Agent ${config.id} already exists`);
    }

    const agent = new Agent({
      ...config,
      eventBus: this.eventBus,
    });

    this.agents.set(config.id, agent);
    console.log(`[AgentManager] Created agent: ${config.name} (${config.id})`);

    return agent;
  }

  /**
   * Get an agent by ID
   */
  getAgent(id: string): Agent {
    const agent = this.agents.get(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }
    return agent;
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.role === role);
  }

  /**
   * Submit a goal to a specific agent
   */
  async submitGoal(agentId: string, goal: Goal): Promise<void> {
    const agent = this.getAgent(agentId);
    console.log(`[AgentManager] Submitting goal to ${agent.name}: ${goal.title}`);

    try {
      const plan = await agent.receiveGoal(goal);
      console.log(`[AgentManager] Goal completed with ${plan.tasks.length} tasks`);
    } catch (error) {
      console.error(`[AgentManager] Goal execution failed:`, error);
      throw error;
    }
  }

  /**
   * Submit a goal to the best matching agent
   */
  async delegateGoal(goal: Goal): Promise<string> {
    const bestAgent = this.findBestAgent(goal);
    if (!bestAgent) {
      throw new Error('No available agent to handle the goal');
    }

    await this.submitGoal(bestAgent.id, goal);
    return bestAgent.id;
  }

  /**
   * Find the best agent for a goal based on skills and availability
   */
  private findBestAgent(goal: Goal): Agent | null {
    const availableAgents = Array.from(this.agents.values()).filter(
      a => a.getState() === 'idle'
    );

    if (availableAgents.length === 0) {
      return null;
    }

    // Score agents based on skill match
    const scores = availableAgents.map(agent => {
      const agentSkills = agent.getInfo().skills;
      const requiredSkills = goal.requiredSkills || [];

      const matchingSkills = requiredSkills.filter(skillId =>
        agentSkills.some(s => s.id === skillId)
      ).length;

      const matchScore = requiredSkills.length > 0
        ? matchingSkills / requiredSkills.length
        : 0;

      return {
        agent,
        score: matchScore,
        successRate: agent.getInfo().successRate,
      };
    });

    // Sort by score, then by success rate
    scores.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score;
      }
      return b.successRate - a.successRate;
    });

    return scores[0]?.agent || null;
  }

  /**
   * Get agent stats
   */
  getStats() {
    const agents = this.getAllAgents();
    return {
      totalAgents: agents.length,
      agentsByRole: this.groupByRole(agents),
      activeAgents: agents.filter(a => a.getState() !== 'idle').length,
      totalTasks: agents.reduce((sum, a) => sum + a.getInfo().taskCount, 0),
      averageSuccessRate:
        agents.length > 0
          ? agents.reduce((sum, a) => sum + a.getInfo().successRate, 0) / agents.length
          : 0,
    };
  }

  /**
   * Get event bus for direct access if needed
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Helper: group agents by role
   */
  private groupByRole(agents: Agent[]): Record<string, number> {
    return agents.reduce(
      (acc, agent) => {
        acc[agent.role] = (acc[agent.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  /**
   * Get conversation between two agents
   */
  getConversation(agent1Id: string, agent2Id: string) {
    return this.eventBus.getConversation(agent1Id, agent2Id);
  }

  /**
   * Get all messages
   */
  getMessageHistory() {
    return this.eventBus.getMessageHistory();
  }

  /**
   * Clear all agents (for testing)
   */
  clear(): void {
    this.agents.clear();
    this.eventBus.clear();
  }
}
