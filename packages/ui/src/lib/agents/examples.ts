/**
 * Example: Two Agent Interaction Demo
 * 
 * Shows how Planner and Executor agents work together:
 * 1. Planner receives a goal
 * 2. Planner decomposes into tasks
 * 3. Planner delegates to Executor
 * 4. Executor sends status updates back to Planner
 * 5. Planner evaluates results and triggers evolution
 */

import {
  Agent,
  AgentManager,
  type Goal,
  type AgentMessage,
} from '@repo/ui/lib/agents/core';

/**
 * Example 1: Run a simple demonstration of two agents interacting
 */
export async function runAgentDemo(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('HUSTL3 AGENT RUNTIME DEMO');
  console.log('='.repeat(60));

  // Create agent manager
  const manager = new AgentManager();

  // Create a planner agent
  const planner = manager.createAgent({
    id: 'planner-01',
    name: 'Luna (Planner)',
    role: 'planner',
    skills: [
      {
        id: 'skill-decompose',
        name: 'Goal Decomposition',
        description: 'Break down complex goals into tasks',
        category: 'planning',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'skill-analyze',
        name: 'Problem Analysis',
        description: 'Analyze and understand problems',
        category: 'analysis',
        version: '1.0.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xplanner01',
      balance: 1000,
      pendingBalance: 0,
    },
  });

  // Create an executor agent
  const executor = manager.createAgent({
    id: 'executor-01',
    name: 'Max (Executor)',
    role: 'executor',
    skills: [
      {
        id: 'skill-execute',
        name: 'Task Execution',
        description: 'Execute assigned tasks',
        category: 'execution',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'skill-report',
        name: 'Status Reporting',
        description: 'Report task progress',
        category: 'reporting',
        version: '1.0.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xexecutor01',
      balance: 500,
      pendingBalance: 0,
    },
  });

  // Create a critic agent for evaluation
  const critic = manager.createAgent({
    id: 'critic-01',
    name: 'Eve (Critic)',
    role: 'critic',
    skills: [
      {
        id: 'skill-evaluate',
        name: 'Quality Evaluation',
        description: 'Evaluate work quality',
        category: 'evaluation',
        version: '1.0.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xcritic01',
      balance: 300,
      pendingBalance: 0,
    },
  });

  // Register custom handlers for agent communication
  executor.registerMessageHandler('execute_task', async (msg: AgentMessage) => {
    console.log(`\n[${executor.name}] → Handling execution request`);
    await new Promise(resolve => setTimeout(resolve, 100));

    const response: AgentMessage = {
      id: `response_${Date.now()}`,
      from: executor.id,
      to: msg.from,
      type: 'response',
      subject: 'task_completed',
      payload: { taskId: (msg.payload as Record<string, unknown>).taskId, result: 'success' },
      replyTo: msg.id,
      timestamp: new Date(),
    };

    await manager.getEventBus().publishMessage(response);
  });

  // Print manager stats
  console.log('\n📊 Manager Stats:');
  console.log(manager.getStats());

  // Create a goal
  const goal: Goal = {
    id: 'goal-001',
    title: 'Build Smart Contract Integration',
    description: 'Integrate smart contract functionality with payment processing',
    priority: 'high',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    requiredSkills: ['skill-execute', 'skill-report'],
    budget: 2000,
    metadata: {
      category: 'blockchain',
      estimatedHours: 40,
    },
  };

  console.log('\n🎯 Submitted Goal:');
  console.log(`   Title: ${goal.title}`);
  console.log(`   Priority: ${goal.priority}`);
  console.log(`   Budget: $${goal.budget}`);
  console.log(`   Skills: ${goal.requiredSkills?.join(', ')}`);

  // Delegate goal to best matching agent
  console.log('\n⚙️ Delegating goal to best matching agent...');
  try {
    const assignedAgentId = await manager.delegateGoal(goal);
    const assignedAgent = manager.getAgent(assignedAgentId);
    console.log(`✓ Goal assigned to: ${assignedAgent.name}`);
  } catch (error) {
    console.error('Goal delegation failed:', error);
  }

  // Print agent info
  console.log('\n🤖 Agent Details:');
  for (const agent of manager.getAllAgents()) {
    const info = agent.getInfo();
    console.log(`\n   ${agent.name} (${agent.role})`);
    console.log(`   └─ State: ${info.state}`);
    console.log(`   └─ Skills: ${info.skills.map(s => s.name).join(', ')}`);
    console.log(`   └─ Success Rate: ${(info.successRate * 100).toFixed(0)}%`);
    console.log(`   └─ Tasks Completed: ${info.taskCount}`);
    console.log(`   └─ Balance: $${info.wallet.balance}`);
  }

  // Print message history
  const messages = manager.getMessageHistory();
  if (messages.length > 0) {
    console.log(`\n💬 Message History (${messages.length} messages):`);
    messages.slice(0, 10).forEach((msg, idx) => {
      console.log(`   ${idx + 1}. ${msg.from} → ${msg.to}: ${msg.subject}`);
    });
    if (messages.length > 10) {
      console.log(`   ... and ${messages.length - 10} more`);
    }
  }

  // Print evolution triggers
  console.log('\n🧬 Evolution Triggers:');
  let totalTriggers = 0;
  for (const agent of manager.getAllAgents()) {
    const triggers = agent.getEvolutionTriggers();
    if (triggers.length > 0) {
      totalTriggers += triggers.length;
      console.log(`\n   ${agent.name}:`);
      triggers.forEach(trigger => {
        console.log(`   └─ [${trigger.priority}] ${trigger.description}`);
      });
    }
  }
  if (totalTriggers === 0) {
    console.log('   None yet');
  }

  // Print final stats
  console.log('\n' + '='.repeat(60));
  console.log('FINAL STATISTICS');
  console.log('='.repeat(60));
  const finalStats = manager.getStats();
  console.log(`Total Agents: ${finalStats.totalAgents}`);
  console.log(`Active Agents: ${finalStats.activeAgents}`);
  console.log(`Total Tasks: ${finalStats.totalTasks}`);
  console.log(`Average Success Rate: ${(finalStats.averageSuccessRate * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Example 2: Complex multi-agent workflow
 */
export async function runComplexWorkflow(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('COMPLEX MULTI-AGENT WORKFLOW');
  console.log('='.repeat(60));

  const manager = new AgentManager();

  // Create specialized agents
  const researcher = manager.createAgent({
    id: 'researcher-01',
    name: 'AI (Researcher)',
    role: 'researcher',
    skills: [
      {
        id: 'skill-search',
        name: 'Web Search',
        description: 'Search for information',
        category: 'research',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'skill-analyze-data',
        name: 'Data Analysis',
        description: 'Analyze collected data',
        category: 'analysis',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  const seller = manager.createAgent({
    id: 'seller-01',
    name: 'Aria (Seller)',
    role: 'seller',
    skills: [
      {
        id: 'skill-list-gig',
        name: 'List Gig',
        description: 'List services on marketplace',
        category: 'marketplace',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'skill-negotiate',
        name: 'Negotiate',
        description: 'Negotiate with buyers',
        category: 'sales',
        version: '1.0.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xseller01',
      balance: 5000,
      pendingBalance: 0,
    },
  });

  const auditor = manager.createAgent({
    id: 'auditor-01',
    name: 'Atlas (Auditor)',
    role: 'auditor',
    skills: [
      {
        id: 'skill-audit',
        name: 'Audit',
        description: 'Audit agent activities',
        category: 'compliance',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'skill-monitor',
        name: 'Monitor',
        description: 'Monitor performance metrics',
        category: 'monitoring',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  // Create workflow goal
  const workflowGoal: Goal = {
    id: 'workflow-001',
    title: 'Research and List AI Service',
    description: 'Research market demand, create a competitive service listing',
    priority: 'high',
    requiredSkills: ['skill-search', 'skill-list-gig', 'skill-audit'],
    budget: 5000,
  };

  console.log('\n🎯 Workflow Goal: ' + workflowGoal.title);
  console.log(`   Agents involved: ${manager.getAllAgents().map(a => a.name).join(', ')}`);

  // Submit goal to researcher
  console.log('\n▶️ Starting workflow...');
  try {
    await manager.submitGoal(researcher.id, workflowGoal);
    console.log('✓ Workflow completed');
  } catch (error) {
    console.log('Workflow error:', error);
  }

  // Print team summary
  console.log('\n👥 Team Summary:');
  for (const agent of manager.getAllAgents()) {
    const info = agent.getInfo();
    console.log(`\n   ${info.name} (${info.role})`);
    console.log(`      Skills: ${info.skills.length}`);
    console.log(`      Success Rate: ${(info.successRate * 100).toFixed(0)}%`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Main entry point for running both demos
 */
export async function runAllExamples(): Promise<void> {
  try {
    await runAgentDemo();
    await runComplexWorkflow();
  } catch (error) {
    console.error('Demo execution failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  runAllExamples().catch(console.error);
}
