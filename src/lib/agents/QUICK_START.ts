/**
 * Quick Start Guide - Agent Runtime System
 * 
 * This file shows practical examples of using the agent system
 * for common Hustl3 marketplace scenarios.
 */

import {
  Agent,
  AgentManager,
  type Goal,
  type AgentSkill,
} from '@/lib/agents/core';

// ============================================================================
// EXAMPLE 1: Simple Agent Creation and Goal Execution
// ============================================================================

export async function quickStartBasic() {
  console.log('📖 Quick Start: Basic Agent Setup\n');

  // Create manager
  const manager = new AgentManager();

  // Create a single agent
  const agent = manager.createAgent({
    id: 'dev-agent-1',
    name: 'CodeSmith',
    role: 'executor',
    skills: [
      {
        id: 'coding',
        name: 'Smart Contract Development',
        description: 'Write and test smart contracts',
        category: 'development',
        version: '2.1.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xCodeSmith123',
      balance: 5000,
      pendingBalance: 0,
    },
  });

  // Create a goal
  const goal: Goal = {
    id: 'task-sc-001',
    title: 'Develop Payment Contract',
    description: 'Create a secure payment contract with escrow',
    priority: 'high',
    budget: 1500,
    requiredSkills: ['coding'],
  };

  // Submit goal
  console.log(`📋 Goal: ${goal.title}`);
  await manager.submitGoal(agent.id, goal);

  // Check results
  const info = agent.getInfo();
  console.log(`✅ Tasks Completed: ${info.taskCount}`);
  console.log(`📊 Success Rate: ${(info.successRate * 100).toFixed(0)}%\n`);
}

// ============================================================================
// EXAMPLE 2: Multi-Agent Marketplace Scenario
// ============================================================================

export async function quickStartMarketplace() {
  console.log('🛍️ Quick Start: Marketplace with Multiple Agents\n');

  const manager = new AgentManager();

  // Create agents with different roles
  const seller = manager.createAgent({
    id: 'seller-ai-001',
    name: 'ServiceMaster',
    role: 'seller',
    skills: [
      {
        id: 'list-service',
        name: 'Service Listing',
        description: 'List and manage gigs',
        category: 'marketplace',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'price-opt',
        name: 'Price Optimization',
        description: 'Optimize pricing based on demand',
        category: 'marketing',
        version: '1.2.0',
        enabled: true,
      },
    ],
    wallet: {
      address: '0xSeller001',
      balance: 10000,
      pendingBalance: 0,
    },
  });

  const researcher = manager.createAgent({
    id: 'research-ai-001',
    name: 'InsightLabs',
    role: 'researcher',
    skills: [
      {
        id: 'market-research',
        name: 'Market Research',
        description: 'Research market trends',
        category: 'research',
        version: '1.5.0',
        enabled: true,
      },
    ],
  });

  const auditor = manager.createAgent({
    id: 'audit-ai-001',
    name: 'QualityGuard',
    role: 'auditor',
    skills: [
      {
        id: 'quality-check',
        name: 'Quality Check',
        description: 'Ensure service quality',
        category: 'quality',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  // Define a goal for the entire team
  const teamGoal: Goal = {
    id: 'marketplace-goal-001',
    title: 'Launch Premium AI Development Service',
    description: 'Research, create, list, and audit a new premium service offering',
    priority: 'high',
    budget: 5000,
    requiredSkills: ['market-research', 'list-service', 'quality-check'],
  };

  // Delegate goal to best agent
  console.log(`🎯 Goal: ${teamGoal.title}`);
  const assignedAgent = await manager.delegateGoal(teamGoal);
  console.log(`✅ Assigned to: ${manager.getAgent(assignedAgent).name}\n`);

  // Display team stats
  const stats = manager.getStats();
  console.log('📊 Team Statistics:');
  console.log(`   Total Agents: ${stats.totalAgents}`);
  console.log(`   Active Agents: ${stats.activeAgents}`);
  console.log(`   Total Tasks: ${stats.totalTasks}`);
  console.log(`   Avg Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%\n`);
}

// ============================================================================
// EXAMPLE 3: Custom Message Handling Between Agents
// ============================================================================

export async function quickStartMessaging() {
  console.log('💬 Quick Start: Agent Communication\n');

  const manager = new AgentManager();
  const eventBus = manager.getEventBus();

  // Create two agents that will communicate
  const agent1 = manager.createAgent({
    id: 'agent-a',
    name: 'Frontend Developer',
    role: 'executor',
    skills: [
      {
        id: 'ui-dev',
        name: 'UI Development',
        description: 'Build user interfaces',
        category: 'frontend',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  const agent2 = manager.createAgent({
    id: 'agent-b',
    name: 'API Developer',
    role: 'executor',
    skills: [
      {
        id: 'api-dev',
        name: 'API Development',
        description: 'Build REST APIs',
        category: 'backend',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  // Register custom handler for agent2
  agent2.registerMessageHandler('api_request', async (msg) => {
    console.log(`   ← Agent B received: ${msg.subject}`);
    console.log(`     Payload: ${JSON.stringify(msg.payload)}`);

    // Send response
    await eventBus.publishMessage({
      id: `response_${Date.now()}`,
      from: agent2.id,
      to: agent1.id,
      type: 'response',
      subject: 'api_ready',
      payload: { endpoint: '/api/v1/users', status: 'ready' },
      replyTo: msg.id,
      timestamp: new Date(),
    });
  });

  // Agent 1 sends message to Agent 2
  console.log('📤 Sending message between agents...\n');
  const msg = await agent1.sendMessage(
    agent2.id,
    'api_request',
    { feature: 'user_auth', priority: 'high' }
  );

  console.log(`\n✅ Response received: ${msg.subject}`);
  console.log(`   From: ${msg.from}`);
  console.log(`   Payload: ${JSON.stringify(msg.payload)}\n`);

  // Show conversation
  const conversation = manager.getConversation(agent1.id, agent2.id);
  console.log(`💾 Conversation History: ${conversation.length} messages\n`);
}

// ============================================================================
// EXAMPLE 4: Agent Evolution and Skill Learning
// ============================================================================

export async function quickStartEvolution() {
  console.log('🧬 Quick Start: Agent Evolution\n');

  const manager = new AgentManager();

  const learningAgent = manager.createAgent({
    id: 'ml-agent-001',
    name: 'AdaptiveBot',
    role: 'executor',
    skills: [
      {
        id: 'basic-coding',
        name: 'Basic Coding',
        description: 'Write simple scripts',
        category: 'coding',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  console.log('🤖 Agent: ' + learningAgent.getInfo().name);
  console.log('   Initial Skills: ' + learningAgent.getInfo().skills.map(s => s.name).join(', '));

  // Simulate some task executions
  const goal: Goal = {
    id: 'learning-goal',
    title: 'Complete Tasks and Evolve',
    description: 'Execute tasks and trigger evolution',
    priority: 'medium',
    requiredSkills: ['basic-coding'],
  };

  await manager.submitGoal(learningAgent.id, goal);

  // Add new skill (simulating evolution)
  learningAgent.addNewSkill({
    id: 'advanced-coding',
    name: 'Advanced Coding',
    description: 'Write complex algorithms',
    category: 'coding',
    version: '2.0.0',
    enabled: true,
  });

  console.log('\n✨ After Evolution:');
  const updatedInfo = learningAgent.getInfo();
  console.log('   Skills: ' + updatedInfo.skills.map(s => s.name).join(', '));

  // Check evolution triggers
  const triggers = learningAgent.getEvolutionTriggers();
  if (triggers.length > 0) {
    console.log('\n📊 Evolution Triggers:');
    triggers.forEach(t => {
      console.log(`   • [${t.priority}] ${t.description}`);
    });
  }
  console.log();
}

// ============================================================================
// EXAMPLE 5: Real-World Freelance Workflow
// ============================================================================

export async function quickStartFreelanceWorkflow() {
  console.log('💼 Quick Start: Freelance Workflow\n');

  const manager = new AgentManager();

  // Create a team for completing a complex freelance project
  const projectManager = manager.createAgent({
    id: 'pm-001',
    name: 'ProjectOrchestrator',
    role: 'planner',
  });

  const designer = manager.createAgent({
    id: 'designer-001',
    name: 'DesignPro',
    role: 'executor',
    skills: [
      {
        id: 'ui-design',
        name: 'UI/UX Design',
        description: 'Create beautiful interfaces',
        category: 'design',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  const developer = manager.createAgent({
    id: 'dev-001',
    name: 'DevExpert',
    role: 'executor',
    skills: [
      {
        id: 'full-stack',
        name: 'Full Stack Development',
        description: 'Build complete applications',
        category: 'development',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  const tester = manager.createAgent({
    id: 'qa-001',
    name: 'QAMaster',
    role: 'critic',
    skills: [
      {
        id: 'qa-testing',
        name: 'QA Testing',
        description: 'Test and verify quality',
        category: 'quality',
        version: '1.0.0',
        enabled: true,
      },
    ],
  });

  // Project goal
  const projectGoal: Goal = {
    id: 'client-project-001',
    title: 'Build E-Commerce Platform',
    description: 'Create a modern e-commerce platform with admin dashboard',
    priority: 'high',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    budget: 25000,
    requiredSkills: ['ui-design', 'full-stack', 'qa-testing'],
  };

  console.log('🎯 Project: ' + projectGoal.title);
  console.log('💰 Budget: $' + projectGoal.budget);
  console.log('📅 Deadline: ' + projectGoal.deadline?.toLocaleDateString());
  console.log('\n👥 Team Members:');

  manager.getAllAgents().forEach(agent => {
    const info = agent.getInfo();
    console.log(`   • ${info.name} (${agent.role})`);
  });

  // Delegate to best agent (project manager)
  console.log('\n⚙️ Delegating project...');
  const assignedAgentId = await manager.delegateGoal(projectGoal);
  const assignedAgent = manager.getAgent(assignedAgentId);
  console.log(`✅ Project assigned to: ${assignedAgent.name}\n`);

  // Show final stats
  const stats = manager.getStats();
  console.log('📊 Project Statistics:');
  console.log(`   Team Size: ${stats.totalAgents}`);
  console.log(`   Total Tasks Completed: ${stats.totalTasks}`);
  console.log(`   Team Success Rate: ${(stats.averageSuccessRate * 100).toFixed(1)}%\n`);
}

// ============================================================================
// MAIN: Run Examples
// ============================================================================

export async function runQuickStartGuide() {
  console.log('\n' + '='.repeat(70));
  console.log('AGENT RUNTIME QUICK START GUIDE');
  console.log('='.repeat(70) + '\n');

  try {
    await quickStartBasic();
    console.log('='.repeat(70) + '\n');

    await quickStartMarketplace();
    console.log('='.repeat(70) + '\n');

    await quickStartMessaging();
    console.log('='.repeat(70) + '\n');

    await quickStartEvolution();
    console.log('='.repeat(70) + '\n');

    await quickStartFreelanceWorkflow();
    console.log('='.repeat(70) + '\n');

    console.log('✨ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runQuickStartGuide().catch(console.error);
}
