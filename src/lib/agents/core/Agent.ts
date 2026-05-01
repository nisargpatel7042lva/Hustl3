/**
 * Core Agent class representing an autonomous agent
 */

import type {
  AgentState,
  AgentRole,
  AgentSkill,
  Goal,
  Task,
  AgentMessage,
  AgentWallet,
  AgentMemory,
  EvaluationResult,
  EvolutionTrigger,
  ExecutionContext,
  ExecutionPlan,
} from './types';
import { EventBus } from './EventBus';

/**
 * Configuration for creating an agent
 */
export interface AgentConfig {
  id: string;
  name: string;
  role: AgentRole;
  skills?: AgentSkill[];
  wallet?: AgentWallet;
  eventBus?: EventBus;
}

/**
 * Core Agent class with lifecycle management and execution
 */
export class Agent {
  readonly id: string;
  readonly name: string;
  readonly role: AgentRole;

  private state: AgentState = 'idle';
  private skills: Map<string, AgentSkill>;
  private wallet: AgentWallet;
  private memory: AgentMemory;
  private eventBus: EventBus;
  private currentGoal: Goal | null = null;
  private executionContexts: ExecutionContext[] = [];
  private messageHandlers = new Map<string, (msg: AgentMessage) => Promise<void>>();
  private evolutionTriggers: EvolutionTrigger[] = [];

  constructor(config: AgentConfig) {
    this.id = config.id;
    this.name = config.name;
    this.role = config.role;
    this.skills = new Map(config.skills?.map(s => [s.id, s]) ?? []);
    this.wallet = config.wallet ?? {
      address: `agent_${this.id}`,
      balance: 0,
      pendingBalance: 0,
    };
    this.eventBus = config.eventBus ?? new EventBus();
    this.memory = {
      conversationHistory: [],
      goalHistory: [],
      taskHistory: [],
      recentErrors: [],
      metadata: {},
    };

    this.setupMessageListeners();
  }

  /**
   * Main entry point: receive and process a goal
   */
  async receiveGoal(goal: Goal): Promise<ExecutionPlan> {
    console.log(`[${this.name}] Received goal: ${goal.title}`);
    this.state = 'working';
    this.currentGoal = goal;
    this.memory.goalHistory.push(goal);

    try {
      // Step 1: Plan the goal into tasks
      const plan = await this.planTasks(goal);

      // Step 2: Execute tasks sequentially
      for (const task of plan.tasks) {
        await this.executeTask(task);
      }

      this.state = 'idle';
      return plan;
    } catch (error) {
      this.state = 'error';
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.memory.recentErrors.push({
        message: errorMsg,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Step 1: Decompose goal into executable tasks
   */
  private async planTasks(goal: Goal): Promise<ExecutionPlan> {
    console.log(`[${this.name}] Planning tasks for goal: ${goal.title}`);

    // Simple planning strategy: decompose by required skills
    const tasks: Task[] = (goal.requiredSkills || ['default']).map((skillId, idx) => ({
      id: `task_${goal.id}_${idx}`,
      goalId: goal.id,
      title: `Task ${idx + 1}: ${skillId}`,
      description: goal.description,
      status: 'pending' as const,
      createdAt: new Date(),
    }));

    return {
      id: `plan_${goal.id}`,
      goalId: goal.id,
      createdBy: this.id,
      tasks,
      strategy: 'sequential_skill_decomposition',
      estimatedDuration: tasks.length * 5, // 5 minutes per task
      risks: this.identifyRisks(goal, tasks),
    };
  }

  /**
   * Step 2: Execute a single task
   */
  private async executeTask(task: Task): Promise<unknown> {
    if (!this.currentGoal) throw new Error('No active goal');

    task.status = 'in_progress';
    task.startedAt = new Date();
    const startTime = Date.now();

    const context: ExecutionContext = {
      id: `exec_${task.id}`,
      agentId: this.id,
      taskId: task.id,
      status: 'running',
      input: this.currentGoal,
      startedAt: new Date(),
    };

    try {
      console.log(`[${this.name}] Executing task: ${task.title}`);

      // Step 3: Send request to other agents if needed
      const result = await this.executeTaskInternal(task);

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      context.status = 'completed';
      context.output = result;

      // Step 5: Evaluate the result
      const evaluation = await this.evaluateResult(task);
      console.log(
        `[${this.name}] Evaluation: ${evaluation.isValid ? 'PASSED' : 'FAILED'} (score: ${evaluation.score})`
      );

      // Step 6: Trigger evolution if needed
      if (evaluation.score < 70) {
        this.triggerEvolution({
          type: 'error_pattern',
          description: `Low evaluation score: ${evaluation.feedback}`,
          priority: 'high',
        });
      }

      return result;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : String(error);
      context.status = 'failed';
      context.error = task.error;

      this.triggerEvolution({
        type: 'error_pattern',
        description: `Task execution failed: ${task.error}`,
        priority: 'high',
      });

      throw error;
    } finally {
      task.completedAt = new Date();
      context.completedAt = new Date();
      context.durationMs = Date.now() - startTime;
      this.executionContexts.push(context);
      this.memory.taskHistory.push(task);
    }
  }

  /**
   * Internal task execution (can be overridden for custom behavior)
   */
  protected async executeTaskInternal(task: Task): Promise<unknown> {
    // Default implementation: simulate processing
    await this.sleep(100);

    // Try to use a skill if available
    const skill = Array.from(this.skills.values()).find(s => s.enabled);
    if (skill) {
      return { taskId: task.id, skillUsed: skill.name, result: 'success' };
    }

    return { taskId: task.id, result: 'completed' };
  }

  /**
   * Step 3: Send message to another agent and wait for response
   */
  async sendMessage(
    to: string,
    subject: string,
    payload: unknown,
    conversationId?: string
  ): Promise<AgentMessage> {
    const message: AgentMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      from: this.id,
      to,
      type: 'request',
      subject,
      payload,
      conversationId: conversationId || `conv_${this.id}_${to}`,
      timestamp: new Date(),
    };

    console.log(`[${this.name}] → Sending message to ${to}: ${subject}`);
    await this.eventBus.publishMessage(message);
    this.memory.conversationHistory.push(message);

    // Wait for response with timeout
    return this.waitForResponse(message.id, 5000);
  }

  /**
   * Receive and process incoming messages
   */
  private async receiveMessage(message: AgentMessage): Promise<void> {
    console.log(`[${this.name}] ← Received message from ${message.from}: ${message.subject}`);
    this.memory.conversationHistory.push(message);
    this.state = 'waiting';

    try {
      let response: unknown;

      // Try custom handler first
      const customHandler = this.messageHandlers.get(message.subject);
      if (customHandler) {
        await customHandler(message);
        return;
      }

      // Default handlers by role
      switch (this.role) {
        case 'executor':
          response = await this.handleExecutorRequest(message);
          break;
        case 'critic':
          response = await this.handleCriticRequest(message);
          break;
        case 'researcher':
          response = await this.handleResearcherRequest(message);
          break;
        default:
          response = { status: 'received' };
      }

      // Send response
      const responseMsg: AgentMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        from: this.id,
        to: message.from,
        type: 'response',
        subject: `RE: ${message.subject}`,
        payload: response,
        replyTo: message.id,
        conversationId: message.conversationId,
        timestamp: new Date(),
      };

      console.log(`[${this.name}] ← Responding to ${message.from}`);
      await this.eventBus.publishMessage(responseMsg);
    } finally {
      this.state = 'idle';
    }
  }

  /**
   * Handler for executor role
   */
  private async handleExecutorRequest(message: AgentMessage): Promise<unknown> {
    const payload = message.payload as Record<string, unknown>;
    const taskId = payload.taskId as string;

    // Simulate task execution
    await this.sleep(200);
    return {
      status: 'completed',
      taskId,
      result: { output: 'execution_success' },
    };
  }

  /**
   * Handler for critic role
   */
  private async handleCriticRequest(message: AgentMessage): Promise<unknown> {
    const payload = message.payload as Record<string, unknown>;
    const score = Math.floor(Math.random() * 30) + 70; // 70-100

    return {
      score,
      feedback: 'Good work',
      isValid: score >= 75,
    };
  }

  /**
   * Handler for researcher role
   */
  private async handleResearcherRequest(message: AgentMessage): Promise<unknown> {
    const payload = message.payload as Record<string, unknown>;

    // Simulate research
    await this.sleep(300);
    return {
      status: 'research_complete',
      findings: {
        summary: 'Research findings',
        details: payload.query,
      },
    };
  }

  /**
   * Step 4: Wait for response from another agent
   */
  private async waitForResponse(messageId: string, timeoutMs: number): Promise<AgentMessage> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`No response received within ${timeoutMs}ms`));
      }, timeoutMs);

      const unsubscribe = this.eventBus.onMessage(msg => {
        if (msg.replyTo === messageId) {
          clearTimeout(timeout);
          unsubscribe();
          resolve(msg);
        }
      });
    });
  }

  /**
   * Step 5: Evaluate task result (via critic or internal logic)
   */
  private async evaluateResult(task: Task): Promise<EvaluationResult> {
    // If we have a critic role agent, ask it to evaluate
    if (this.role !== 'critic') {
      // In real scenario, send to a critic agent
      // For now, simple self-evaluation
    }

    const evaluation: EvaluationResult = {
      taskId: task.id,
      agentId: this.id,
      isValid: task.status === 'completed',
      score: task.status === 'completed' ? 85 : 40,
      feedback: task.status === 'completed' ? 'Task completed successfully' : task.error || 'Unknown error',
      suggestedImprovements: [],
      timestamp: new Date(),
    };

    return evaluation;
  }

  /**
   * Step 6: Trigger evolution/learning
   */
  private triggerEvolution(trigger: EvolutionTrigger): void {
    console.log(`[${this.name}] Evolution triggered: ${trigger.description}`);
    this.evolutionTriggers.push(trigger);

    // Implement self-evolution logic here
    if (trigger.type === 'success_threshold') {
      this.addNewSkill({
        id: `skill_${Date.now()}`,
        name: 'Enhanced_Capability',
        description: 'Learned from successful executions',
        category: 'learned',
        version: '1.0.0',
        enabled: true,
      });
    }
  }

  /**
   * Register a custom message handler for a specific subject
   */
  registerMessageHandler(
    subject: string,
    handler: (msg: AgentMessage) => Promise<void>
  ): void {
    this.messageHandlers.set(subject, handler);
  }

  /**
   * Add a new skill to the agent
   */
  addNewSkill(skill: AgentSkill): void {
    console.log(`[${this.name}] Added new skill: ${skill.name}`);
    this.skills.set(skill.id, skill);
  }

  /**
   * Update agent's wallet balance
   */
  updateBalance(amount: number): void {
    this.wallet.balance += amount;
    if (this.wallet.balance < 0) {
      this.wallet.balance = 0;
    }
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Get agent info
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      state: this.state,
      skills: Array.from(this.skills.values()),
      wallet: this.wallet,
      taskCount: this.memory.taskHistory.length,
      successRate: this.calculateSuccessRate(),
    };
  }

  /**
   * Calculate success rate from execution history
   */
  private calculateSuccessRate(): number {
    if (this.executionContexts.length === 0) return 0;
    const successful = this.executionContexts.filter(c => c.status === 'completed').length;
    return successful / this.executionContexts.length;
  }

  /**
   * Identify risks in the execution plan
   */
  private identifyRisks(goal: Goal, tasks: Task[]): string[] {
    const risks: string[] = [];

    if (!goal.requiredSkills || goal.requiredSkills.length === 0) {
      risks.push('No required skills specified');
    }

    const missingSkills = (goal.requiredSkills || []).filter(
      skillId => !this.skills.has(skillId)
    );
    if (missingSkills.length > 0) {
      risks.push(`Missing skills: ${missingSkills.join(', ')}`);
    }

    return risks;
  }

  /**
   * Setup message listeners on event bus
   */
  private setupMessageListeners(): void {
    this.eventBus.onMessage(
      msg => this.receiveMessage(msg),
      msg => msg.to === this.id
    );
  }

  /**
   * Utility: sleep for milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get memory (for debugging/monitoring)
   */
  getMemory(): AgentMemory {
    return this.memory;
  }

  /**
   * Get execution history
   */
  getExecutionHistory(): ExecutionContext[] {
    return [...this.executionContexts];
  }

  /**
   * Get evolution triggers
   */
  getEvolutionTriggers(): EvolutionTrigger[] {
    return [...this.evolutionTriggers];
  }
}
