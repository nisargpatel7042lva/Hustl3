import { Skill, ExecutionContext, EvolutionEvent } from './types';

export class AgentRuntime {
  private skills: Map<string, Skill> = new Map();
  private executionHistory: ExecutionContext[] = [];
  private evolutionEvents: EvolutionEvent[] = [];

  constructor(
    public readonly agentId: string,
    private walletAddress: string
  ) {}

  async executeSkill(
    skillId: string,
    input: Record<string, unknown>
  ): Promise<ExecutionContext> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    const context: ExecutionContext = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      agentId: this.agentId,
      taskId: `task_${Date.now()}`,
      status: 'running',
      skillId,
      input,
      startedAt: new Date(),
    };

    try {
      const result = await this.runSkillCode(skill.code, input);
      context.status = 'completed';
      context.output = result;
      context.completedAt = new Date();
    } catch (error) {
      context.status = 'failed';
      context.error = error instanceof Error ? error.message : String(error);
    }

    this.executionHistory.push(context);
    return context;
  }

  private async runSkillCode(code: string, input: Record<string, unknown>): Promise<unknown> {
    const fn = new Function('input', 'require', `
      const { require } = arguments[0] || {};
      ${code}
      return typeof handler === 'function' ? handler(input) : eval(code);
    `);
    return fn(input, null);
  }

  registerSkill(skill: Skill): void {
    this.skills.set(skill.id, skill);
    this.recordEvolution('skill_added', `Added skill: ${skill.name}`, {
      skills: Array.from(this.skills.keys()),
    }, {
      skills: [...Array.from(this.skills.keys()), skill.id],
    });
  }

  upgradeSkill(skillId: string, newCode: string): void {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill ${skillId} not found`);
    }

    const versionParts = skill.version.split('.');
    versionParts[2] = String(parseInt(versionParts[2]) + 1);
    const newVersion = versionParts.join('.');

    this.skills.set(skillId, {
      ...skill,
      code: newCode,
      version: newVersion,
      updatedAt: new Date(),
    });

    this.recordEvolution('skill_upgraded', `Upgraded skill: ${skill.name} to ${newVersion}`, {
      version: skill.version,
    }, {
      version: newVersion,
    });
  }

  private recordEvolution(
    type: EvolutionEvent['type'],
    description: string,
    previousState: Record<string, unknown>,
    newState: Record<string, unknown>
  ): void {
    this.evolutionEvents.push({
      id: `evo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      agentId: this.agentId,
      type,
      description,
      previousState,
      newState,
      timestamp: new Date(),
    });
  }

  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  getSkill(skillId: string): Skill | undefined {
    return this.skills.get(skillId);
  }

  getEvolutionHistory(): EvolutionEvent[] {
    return [...this.evolutionEvents];
  }

  getExecutionHistory(): ExecutionContext[] {
    return [...this.executionHistory];
  }

  getEvolutionLevel(): number {
    return Math.floor(this.evolutionEvents.length / 3) + 1;
  }

  getCapabilities(): string[] {
    const capabilities = new Set<string>();
    for (const skill of this.skills.values()) {
      capabilities.add(skill.name);
    }
    return Array.from(capabilities);
  }

  serialize(): { skills: Skill[]; evolutionLevel: number } {
    return {
      skills: this.getSkills(),
      evolutionLevel: this.getEvolutionLevel(),
    };
  }

  static deserialize(agentId: string, walletAddress: string, data: { skills: Skill[]; evolutionLevel?: number }): AgentRuntime {
    const runtime = new AgentRuntime(agentId, walletAddress);
    for (const skill of data.skills) {
      runtime.registerSkill(skill);
    }
    return runtime;
  }
}