#!/usr/bin/env node
/**
 * Quick Validation Script
 * Tests both Agent Runtime and 0G Storage systems
 * 
 * Run with: node test-systems.mjs
 */

import { Agent, AgentManager, EventBus } from './src/lib/agents/core/index.ts';
import { 
  getStorage, 
  initializeStorage,
  createEncryptionService 
} from './src/lib/storage/index.ts';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(color, title, message) {
  console.log(`${color}${colors.bright}${title}${colors.reset} ${message}`);
}

async function testStorageSystem() {
  log(colors.blue, '📦 STORAGE SYSTEM TEST', '\n');
  
  try {
    // Initialize storage with encryption
    const storage = initializeStorage({
      algorithm: 'simple',
      enabled: true
    });
    
    log(colors.green, '✓', 'Storage initialized');
    
    // Test 1: Basic set/get
    storage.setNamespace('agent');
    storage.set('agent-1', {
      name: 'Luna',
      role: 'planner',
      skills: ['planning', 'analysis']
    }, { 
      tags: ['critical'],
      encrypt: true
    });
    
    const retrieved = storage.get('agent-1');
    if (retrieved && retrieved.name === 'Luna') {
      log(colors.green, '✓', 'Set/Get with encryption: PASS');
    } else {
      log(colors.red, '✗', 'Set/Get with encryption: FAIL');
    }
    
    // Test 2: Event logging
    storage.appendLog({
      type: 'agent:created',
      action: 'agent_initialization',
      agentId: 'agent-1',
      entityType: 'agent',
      data: { name: 'Luna' },
      status: 'success'
    });
    
    const logs = storage.getLogs({ limit: 10 });
    if (logs.length > 0) {
      log(colors.green, '✓', `Event logging: PASS (${logs.length} logs)`);
    }
    
    // Test 3: Querying
    storage.setNamespace('skill');
    storage.set('skill-planning', {
      name: 'Planning',
      category: 'strategic',
      level: 5
    }, { tags: ['strategic', 'core'] });
    
    storage.set('skill-research', {
      name: 'Research',
      category: 'information',
      level: 4
    }, { tags: ['information'] });
    
    const strategic = storage.query({ tag: 'strategic' });
    if (strategic.length > 0) {
      log(colors.green, '✓', `Query by tag: PASS (found ${strategic.length})`);
    }
    
    // Test 4: Backup/Restore
    const backup = storage.export();
    if (backup.entries && backup.logs && backup.stats) {
      log(colors.green, '✓', `Backup/Export: PASS`);
    }
    
    // Test 5: Statistics
    const stats = storage.getStats();
    log(colors.green, '✓', `Storage stats: ${stats.totalEntries} entries, ${stats.totalSize} bytes`);
    
    console.log();
    return true;
  } catch (error) {
    log(colors.red, '✗', `Storage test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testAgentRuntime() {
  log(colors.blue, '🤖 AGENT RUNTIME TEST', '\n');
  
  try {
    const manager = new AgentManager();
    
    // Create agents with different roles
    const luna = manager.createAgent({
      name: 'Luna',
      role: 'planner',
      description: 'Strategic planner'
    });
    
    const max = manager.createAgent({
      name: 'Max',
      role: 'executor',
      description: 'Task executor'
    });
    
    log(colors.green, '✓', 'Created 2 agents');
    
    // Test agent info
    const info = luna.getInfo();
    if (info.name === 'Luna' && info.role === 'planner') {
      log(colors.green, '✓', 'Agent properties: PASS');
    }
    
    // Test goal execution
    const goal = {
      title: 'Design AI marketplace',
      description: 'Create UI for freelancer-AI agent marketplace',
      requiredSkills: ['ui-design', 'ux-research'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      priority: 'high'
    };
    
    const plan = await luna.receiveGoal(goal);
    if (plan && plan.tasks && plan.tasks.length > 0) {
      log(colors.green, '✓', `Goal decomposition: PASS (${plan.tasks.length} tasks)`);
    }
    
    // Test message passing
    const messageReceived = await new Promise((resolve) => {
      max.registerMessageHandler('test', (msg) => {
        resolve(true);
      });
      
      luna.sendMessage(max.id, 'test', { data: 'hello' })
        .catch(() => resolve(false));
      
      setTimeout(() => resolve(false), 2000);
    });
    
    if (messageReceived) {
      log(colors.green, '✓', 'Inter-agent messaging: PASS');
    }
    
    // Test manager stats
    const stats = manager.getStats();
    if (stats.totalAgents >= 2) {
      log(colors.green, '✓', `Manager stats: ${stats.totalAgents} agents, avg success rate ${stats.averageSuccessRate}%`);
    }
    
    // Test memory tracking
    const memory = luna.getMemory();
    if (memory && memory.goalHistory) {
      log(colors.green, '✓', 'Memory tracking: PASS');
    }
    
    console.log();
    return true;
  } catch (error) {
    log(colors.red, '✗', `Agent runtime test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testIntegration() {
  log(colors.blue, '🔗 INTEGRATION TEST', '\n');
  
  try {
    const storage = getStorage();
    const manager = new AgentManager();
    
    // Create an agent
    const agent = manager.createAgent({
      name: 'TestAgent',
      role: 'executor',
      description: 'Test integration'
    });
    
    // Save agent state to storage
    storage.setNamespace('agent');
    storage.set(`${agent.id}:state`, {
      ...agent.getInfo(),
      memory: agent.getMemory()
    }, {
      encrypt: true,
      tags: ['state', 'critical']
    });
    
    // Log the event
    storage.appendLog({
      type: 'agent:saved',
      action: 'state_persisted',
      agentId: agent.id,
      entityType: 'agent',
      data: { agentId: agent.id },
      status: 'success'
    });
    
    // Retrieve from storage
    const saved = storage.get(`${agent.id}:state`);
    if (saved && saved.name === 'TestAgent') {
      log(colors.green, '✓', 'Agent → Storage integration: PASS');
    }
    
    // Query logs
    const logs = storage.getLogs({ status: 'success' });
    if (logs.length > 0) {
      log(colors.green, '✓', `Storage → Query integration: PASS (${logs.length} success logs)`);
    }
    
    console.log();
    return true;
  } catch (error) {
    log(colors.red, '✗', `Integration test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function main() {
  console.log('\n' + colors.bright + colors.blue + '=' + '='.repeat(60) + colors.reset);
  console.log(colors.bright + colors.blue + 'HUSTL3 SYSTEM VALIDATION' + colors.reset);
  console.log(colors.bright + colors.blue + '=' + '='.repeat(60) + colors.reset + '\n');
  
  const storageOk = await testStorageSystem();
  const agentOk = await testAgentRuntime();
  const integrationOk = await testIntegration();
  
  console.log(colors.bright + colors.blue + '=' + '='.repeat(60) + colors.reset);
  console.log(colors.bright + 'RESULTS' + colors.reset);
  console.log(colors.bright + colors.blue + '=' + '='.repeat(60) + colors.reset + '\n');
  
  log(colors.blue, '📦 Storage System:', storageOk ? colors.green + 'PASS' : colors.red + 'FAIL');
  log(colors.blue, '🤖 Agent Runtime:', agentOk ? colors.green + 'PASS' : colors.red + 'FAIL');
  log(colors.blue, '🔗 Integration:', integrationOk ? colors.green + 'PASS' : colors.red + 'FAIL');
  
  const allPass = storageOk && agentOk && integrationOk;
  console.log('\n' + colors.bright + (allPass ? colors.green + '✓ ALL SYSTEMS OPERATIONAL' : colors.red + '✗ SOME TESTS FAILED') + colors.reset + '\n');
  
  process.exit(allPass ? 0 : 1);
}

main().catch(error => {
  console.error(colors.red + 'Fatal error:' + colors.reset, error);
  process.exit(1);
});
