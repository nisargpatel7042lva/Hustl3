/**
 * DEMO: Complete System - Compute + Evolution + 6 Roles
 * Shows all 3 systems in action
 */

import { Agent } from './core/Agent';
import { compute } from './compute';
import { SelfEvolutionLoop } from './SelfEvolutionLoop';
import { Planner, Researcher, Executor, Critic, Seller, Auditor } from './roles';
import { getStorage } from '../storage';

const storage = getStorage();

/**
 * Demo 1: 0G Compute Wrapper
 */
export async function demoComputeWrapper() {
  console.log('\n' + '='.repeat(60));
  console.log('🤖 DEMO 1: 0G Compute Wrapper');
  console.log('='.repeat(60));

  // Generate a skill from gap
  console.log('\n📝 Generating skill from gap: "market_analysis"');
  const skillGen = await compute.generateSkill('Analyze market trends');
  console.log(`Result: ${skillGen.success ? '✓' : '✗'}`);
  if (skillGen.skill) {
    console.log(`Generated (${skillGen.skill.substring(0, 50)}...)`);
  }

  // Evaluate output quality
  console.log('\n📊 Evaluating output quality...');
  const output = { analysis: 'complex market data', insights: ['trend1', 'trend2', 'trend3'] };
  const evaluation = await compute.evaluate(output);
  console.log(`Score: ${evaluation.score}/100 (${evaluation.attempts} attempts)`);

  storage.appendLog({
    type: 'demo:compute',
    action: 'demo_completed',
    data: { skillGenSuccess: skillGen.success, evaluationScore: evaluation.score },
    status: 'success',
  });
}

/**
 * Demo 2: Self-Evolution Loop
 */
export async function demoEvolutionLoop() {
  console.log('\n' + '='.repeat(60));
  console.log('🔄 DEMO 2: Self-Evolution Loop');
  console.log('='.repeat(60));

  const agent = new Agent({
    id: 'agent-evolve-demo',
    name: 'EvolutionBot',
    role: 'executor',
    skills: [],
  });

  const evolution = new SelfEvolutionLoop(agent);

  // Simulate poor result
  console.log('\n❌ Simulating poor result...');
  const poorOutput = { quality: 15, errors: 5 };

  // Run evolution loop
  const evolved = await evolution.evolveFromResult(poorOutput);
  console.log(`Evolution triggered: ${evolved ? '✓' : '✗'}`);

  // Upgrade a skill
  if (evolved) {
    console.log('\n⬆️  Upgrading skill tier...');
    await evolution.upgradeSkill('skill_demo_1', 'Expert');
  }

  // Show storage logs
  const logs = storage.getLogs({ type: 'agent:evolution', limit: 5 });
  console.log(`\n📋 Evolution logs: ${logs.length} entries`);
}

/**
 * Demo 3: 6 Agent Roles in Action
 */
export async function demoAgentRoles() {
  console.log('\n' + '='.repeat(60));
  console.log('👥 DEMO 3: 6 Agent Roles');
  console.log('='.repeat(60));

  const agent = new Agent({
    id: 'agent-roles-demo',
    name: 'RoleBot',
    role: 'planner',
    skills: [],
  });

  // 1. PLANNER
  console.log('\n🎯 1. PLANNER - Planning goal');
  const planner = new Planner(agent);
  const plan = await planner.planGoal('build_marketplace');
  console.log(`   Tasks: ${plan.tasks.length}, Agents: ${plan.selectedAgents.length}`);

  // 2. RESEARCHER
  console.log('\n📚 2. RESEARCHER - Generating knowledge');
  const researcher = new Researcher(agent);
  const knowledge = await researcher.generateKnowledge('payment_systems');
  console.log(`   Knowledge generated: ${knowledge.substring(0, 50)}...`);

  // 3. EXECUTOR
  console.log('\n⚙️  3. EXECUTOR - Executing task with payment');
  const executor = new Executor(agent);
  const result = await executor.executeTask('process_order', 25);
  console.log(`   Execution: ${result.success ? '✓' : '✗'}, TxHash: ${result.txHash}`);

  // 4. CRITIC
  console.log('\n🔍 4. CRITIC - Scoring output');
  const critic = new Critic(agent);
  const score = await critic.scoreOutput({ quality: 85 }, 'marketplace_output');
  console.log(`   Score: ${score.score}/100`);
  console.log(`   Feedback: ${score.feedback}`);

  // 5. SELLER
  console.log('\n💼 5. SELLER - Listing skill on marketplace');
  const seller = new Seller(agent);
  const listing = await seller.listSkill('market_analysis', 'Verified', 50);
  console.log(`   Listed: ${listing.listingId}, Success: ${listing.success}`);

  // 6. AUDITOR
  console.log('\n✓ 6. AUDITOR - Auditing agent & assigning tier');
  const auditor = new Auditor(agent);
  const audit = await auditor.auditAgent();
  console.log(`   Tier: ${audit.tier}, Skills: ${audit.skills}, Score: ${audit.score.toFixed(1)}`);
  await auditor.assignTier(audit.tier);
  console.log(`   Tier assigned!`);

  // Show summary
  console.log('\n📊 ROLES DEMO SUMMARY');
  console.log('   ✓ Planner created execution plan');
  console.log('   ✓ Researcher generated knowledge');
  console.log('   ✓ Executor processed payment');
  console.log('   ✓ Critic scored quality');
  console.log('   ✓ Seller listed marketplace');
  console.log('   ✓ Auditor assigned tier');
}

/**
 * INTEGRATED DEMO: Full workflow
 * Planner → Researcher → Executor → Critic → (if score < threshold) → Evolution → Seller → Auditor
 */
export async function demoIntegratedWorkflow() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 DEMO 4: Integrated Workflow');
  console.log('='.repeat(60));

  const agent = new Agent({
    id: 'agent-integrated',
    name: 'FullStackBot',
    role: 'planner',
    skills: [],
  });

  // Step 1: Plan
  console.log('\n[1/7] Planning...');
  const planner = new Planner(agent);
  const plan = await planner.planGoal('optimize_trading');

  // Step 2: Research
  console.log('[2/7] Researching...');
  const researcher = new Researcher(agent);
  await researcher.generateKnowledge('trading_algorithms');

  // Step 3: Execute
  console.log('[3/7] Executing...');
  const executor = new Executor(agent);
  const taskResult = await executor.executeTask('run_backtest', 30);

  // Step 4: Critique
  console.log('[4/7] Critiquing...');
  const critic = new Critic(agent);
  const critique = await critic.scoreOutput(taskResult.result, 'execution_quality');

  // Step 5-6: Evolution (if score < threshold)
  console.log(`[5/7] Evaluating score (${critique.score})...`);
  if (critique.score < 70) {
    console.log('[6/7] Evolution triggered!');
    const evolution = new SelfEvolutionLoop(agent);
    await evolution.evolveFromResult(taskResult.result);
  } else {
    console.log('[6/7] Score acceptable, skipping evolution');
  }

  // Step 7: Sell
  console.log('[7/7] Listing skill...');
  const seller = new Seller(agent);
  const tier = critique.score > 70 ? 'Verified' : 'Junior';
  await seller.listSkill('trading_bot', tier, 100);

  // Final audit
  const auditor = new Auditor(agent);
  const finalAudit = await auditor.auditAgent();
  console.log(`\n✓ Final Tier: ${finalAudit.tier}, Skills: ${finalAudit.skills}`);

  // Show all logs
  const allLogs = storage.getLogs({ limit: 20 });
  console.log(`\n📋 Total logs recorded: ${allLogs.length}`);
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('\n🎬 STARTING DEMOS...\n');

  try {
    await demoComputeWrapper();
    await demoEvolutionLoop();
    await demoAgentRoles();
    await demoIntegratedWorkflow();

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL DEMOS COMPLETED');
    console.log('='.repeat(60));

    // Export storage for verification
    const exported = storage.export();
    console.log(`\n📊 Storage Summary:`);
    console.log(`   Entries: ${exported.stats.totalEntries}`);
    console.log(`   Logs: ${exported.stats.logEntries}`);
    console.log(`   Encrypted: ${exported.stats.encryption.keysUsed}`);
  } catch (error) {
    console.error('❌ Demo error:', error);
  }
}

// Uncomment to run:
// runAllDemos();
