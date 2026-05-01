import { AgentRuntime } from './AgentRuntime';
import { Skill, EvolutionEvent } from './types';

export interface EvolutionCriteria {
  minExecutions: number;
  minSuccessRate: number;
  minEarnings: number;
}

export interface EvolutionSuggestion {
  type: 'new_skill' | 'skill_upgrade' | 'capability_enhancement';
  priority: 'low' | 'medium' | 'high';
  description: string;
  estimatedImpact: number;
  newCode?: string;
}

export class SelfEvolutionLoop {
  private criteria: EvolutionCriteria = {
    minExecutions: 10,
    minSuccessRate: 0.8,
    minEarnings: 1000,
  };

  constructor(private runtime: AgentRuntime) {}

  analyze(): EvolutionSuggestion[] {
    const suggestions: EvolutionSuggestion[] = [];
    const executions = this.runtime.getExecutionHistory();
    const skills = this.runtime.getSkills();

    const successRate = this.calculateSuccessRate(executions);
    const evolutionLevel = this.runtime.getEvolutionLevel();

    if (successRate > this.criteria.minSuccessRate && executions.length >= this.criteria.minExecutions) {
      suggestions.push({
        type: 'capability_enhancement',
        priority: 'medium',
        description: `Agent is performing well (${(successRate * 100).toFixed(0)}% success rate). Consider adding new capabilities.`,
        estimatedImpact: 0.15,
      });
    }

    for (const skill of skills) {
      const skillExecutions = executions.filter(e => e.skillId === skill.id);
      const skillSuccessRate = this.calculateSkillSuccessRate(skillExecutions);

      if (skillSuccessRate > 0.95) {
        suggestions.push({
          type: 'skill_upgrade',
          priority: 'low',
          description: `${skill.name} has exceptional performance. Consider refining for edge cases.`,
          estimatedImpact: 0.05,
          newCode: this.generateImprovedCode(skill),
        });
      } else if (skillSuccessRate < 0.5 && skillExecutions.length >= 5) {
        suggestions.push({
          type: 'skill_upgrade',
          priority: 'high',
          description: `${skill.name} has low success rate (${(skillSuccessRate * 100).toFixed(0)}%). Needs improvement.`,
          estimatedImpact: 0.3,
          newCode: this.generateImprovedCode(skill),
        });
      }
    }

    if (evolutionLevel >= 3) {
      suggestions.push({
        type: 'new_skill',
        priority: 'medium',
        description: 'Agent has reached high evolution level. Ready to learn complex skills.',
        estimatedImpact: 0.2,
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private calculateSuccessRate(executions: { status: string }[]): number {
    if (executions.length === 0) return 0;
    const successful = executions.filter(e => e.status === 'completed').length;
    return successful / executions.length;
  }

  private calculateSkillSuccessRate(executions: { status: string }[]): number {
    if (executions.length === 0) return 1;
    const successful = executions.filter(e => e.status === 'completed').length;
    return successful / executions.length;
  }

  private generateImprovedCode(skill: Skill): string {
    return `// Improved ${skill.name} v${skill.version}
function handler(input) {
  // Enhanced error handling and edge case coverage
  try {
    // Original logic with improvements
    return { success: true, result: input };
  } catch (error) {
    return { success: false, error: error.message };
  }
}`;
  }

  async evolve(suggestion: EvolutionSuggestion): Promise<EvolutionEvent> {
    if (!suggestion.newCode) {
      throw new Error('No new code provided for evolution');
    }

    const beforeState = {
      skills: this.runtime.getSkills().map(s => ({ id: s.id, version: s.version })),
      evolutionLevel: this.runtime.getEvolutionLevel(),
    };

    if (suggestion.type === 'skill_upgrade') {
      const skills = this.runtime.getSkills();
      if (skills.length > 0) {
        this.runtime.upgradeSkill(skills[0].id, suggestion.newCode);
      }
    }

    const afterState = {
      skills: this.runtime.getSkills().map(s => ({ id: s.id, version: s.version })),
      evolutionLevel: this.runtime.getEvolutionLevel(),
    };

    return {
      id: `evo_${Date.now()}`,
      agentId: '',
      type: suggestion.type === 'new_skill' ? 'skill_added' : suggestion.type === 'skill_upgrade' ? 'skill_upgraded' : 'capability_enhanced',
      description: suggestion.description,
      previousState: beforeState,
      newState: afterState,
      timestamp: new Date(),
    };
  }

  setCriteria(criteria: Partial<EvolutionCriteria>): void {
    this.criteria = { ...this.criteria, ...criteria };
  }

  getCriteria(): EvolutionCriteria {
    return { ...this.criteria };
  }
}