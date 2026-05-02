/**
 * Storage Examples - Using Storage Service with Agent Runtime
 * 
 * Shows practical usage of storage for:
 * - Agent memory persistence
 * - Skill storage and versioning
 * - Gig listings
 * - Event audit trail
 */

import { StorageService } from './storage';
import { EncryptionService } from './encryption';
import type { StorageNamespace } from './types';

// ============================================================================
// EXAMPLE 1: Agent Memory Persistence
// ============================================================================

export function exampleAgentMemory() {
  console.log('\n📦 Example 1: Agent Memory Storage\n');

  // Create storage with encryption for agent data
  const encryption = new EncryptionService({
    algorithm: 'simple',
    enabled: true, // Enable encryption for agent data
  });
  const storage = new StorageService(encryption);
  storage.setNamespace('agent');

  // Store agent state
  const agentId = 'agent-luna-01';
  const agentMemory = {
    name: 'Luna',
    role: 'planner',
    state: 'idle',
    skills: ['goal-decomposition', 'task-planning'],
    conversationHistory: [
      { from: 'user', to: 'agent', message: 'Build a smart contract' },
      { from: 'agent', to: 'user', message: 'Planning tasks...' },
    ],
    executionCount: 42,
    successRate: 0.85,
    lastUpdate: new Date().toISOString(),
  };

  // Save agent memory (encrypted)
  storage.set(`${agentId}:memory`, agentMemory, {
    encrypt: true,
    tags: ['agent-state', 'critical'],
    metadata: { agentId, version: '1.0' },
  });

  console.log('✓ Stored agent memory (encrypted)');

  // Retrieve agent memory
  const retrieved = storage.get<{ name: string }>(`${agentId}:memory`);
  console.log(`✓ Retrieved agent memory: ${retrieved?.name}`);

  // Store conversation history separately
  storage.set(
    `${agentId}:conversations`,
    [
      {
        id: 'conv-1',
        with: 'executor-max',
        messages: 5,
        status: 'completed',
        timestamp: new Date().toISOString(),
      },
    ],
    {
      encrypt: true,
      tags: ['conversations'],
    }
  );

  console.log('✓ Stored conversation history');

  // Get agent stats
  const stats = storage.getStats();
  console.log(`\n📊 Storage Stats:`);
  console.log(`   Total entries: ${stats.totalEntries}`);
  console.log(`   Encrypted keys: ${stats.encryption.keysUsed}`);
  console.log(`   Total size: ${stats.totalSize} bytes`);

  // Get logs
  const logs = storage.getLogs({ entityType: 'agent' });
  console.log(`\n📋 Agent-related logs: ${logs.length}`);
}

// ============================================================================
// EXAMPLE 2: Skill Storage and Versioning
// ============================================================================

export function exampleSkillStorage() {
  console.log('\n🔧 Example 2: Skill Storage and Versioning\n');

  const storage = new StorageService();
  storage.setNamespace('skill');

  // Define skills
  const skills = [
    {
      id: 'skill-solidity',
      name: 'Smart Contract Development',
      version: '2.1.0',
      code: 'function deployContract() { /* ... */ }',
      tags: ['blockchain', 'ethereum', 'production-ready'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 156,
      successRate: 0.92,
    },
    {
      id: 'skill-testing',
      name: 'Smart Contract Testing',
      version: '1.5.0',
      code: 'function runTests() { /* ... */ }',
      tags: ['testing', 'hardhat', 'production-ready'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 203,
      successRate: 0.98,
    },
  ];

  // Store skills
  for (const skill of skills) {
    storage.set(skill.id, skill, {
      tags: skill.tags,
      metadata: {
        version: skill.version,
        usageCount: skill.usageCount,
      },
    });
  }

  console.log(`✓ Stored ${skills.length} skills`);

  // Query skills by tag
  const blockchainSkills = storage.query({
    keyPattern: 'skill:skill-*',
    tag: 'production-ready',
  });

  console.log(`✓ Found ${blockchainSkills.length} production-ready skills`);

  // Get specific skill
  const soliditySkill = storage.get<{ name: string; version: string }>('skill-solidity');
  if (soliditySkill) {
    console.log(`✓ Retrieved skill: ${soliditySkill.name} v${soliditySkill.version}`);
  }

  // Update skill (new version)
  const updatedSkill = { ...soliditySkill, version: '2.2.0', usageCount: 157 };
  storage.set('skill-solidity', updatedSkill, {
    metadata: { version: '2.2.0', previousVersion: '2.1.0' },
  });

  console.log('✓ Upgraded skill to v2.2.0');

  // Get all skills
  const allSkills = storage.keys().filter(k => k.startsWith('skill:'));
  console.log(`\n📚 All skills: ${allSkills.length}`);
}

// ============================================================================
// EXAMPLE 3: Gig Listings Storage
// ============================================================================

export function exampleGigStorage() {
  console.log('\n🎯 Example 3: Gig Listings Storage\n');

  const storage = new StorageService();
  storage.setNamespace('gig');

  // Create gig listings
  const gigs = [
    {
      id: 'gig-sc-001',
      title: 'Smart Contract Audit',
      description: 'Professional security audit for ERC20 contract',
      seller: 'agent-security-01',
      price: 5000,
      tier: 'premium',
      skills: ['solidity', 'security-audit'],
      completedCount: 45,
      rating: 4.9,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gig-api-001',
      title: 'REST API Development',
      description: 'Build RESTful API with Node.js and Express',
      seller: 'agent-dev-02',
      price: 2000,
      tier: 'standard',
      skills: ['nodejs', 'express', 'rest-api'],
      completedCount: 120,
      rating: 4.7,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'gig-frontend-001',
      title: 'React Component Development',
      description: 'Build reusable React components',
      seller: 'agent-frontend-03',
      price: 1500,
      tier: 'standard',
      skills: ['react', 'typescript', 'tailwind'],
      completedCount: 200,
      rating: 4.8,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  // Store gigs
  for (const gig of gigs) {
    storage.set(gig.id, gig, {
      tags: [gig.tier, gig.status, ...gig.skills],
      metadata: {
        seller: gig.seller,
        rating: gig.rating,
      },
    });
  }

  console.log(`✓ Stored ${gigs.length} gigs`);

  // Query premium gigs
  const premiumGigs = storage.query({
    tag: 'premium',
  });

  console.log(`✓ Found ${premiumGigs.length} premium gigs`);

  // Search by skill
  const solidityGigs = storage.query({
    tag: 'solidity',
  });

  console.log(`✓ Found ${solidityGigs.length} gigs with Solidity skill`);

  // Get marketplace stats
  const allGigs = storage.keys();
  console.log(`\n📊 Marketplace Stats:`);
  console.log(`   Total gigs: ${allGigs.length}`);

  // Calculate average rating
  const stats = storage.query();
  const avgRating = stats.length > 0
    ? stats
        .reduce((sum, entry) => {
          const gig = entry.value as any;
          return sum + (gig.rating || 0);
        }, 0) / stats.length
    : 0;

  console.log(`   Average rating: ${avgRating.toFixed(2)}`);

  // Get logs
  const gigLogs = storage.getLogs({ entityType: 'gig' });
  console.log(`   Total events: ${gigLogs.length}`);
}

// ============================================================================
// EXAMPLE 4: Audit Trail and Event Logging
// ============================================================================

export function exampleAuditTrail() {
  console.log('\n📋 Example 4: Audit Trail and Event Logging\n');

  const storage = new StorageService();

  // Store some data
  storage.set('user:profile:alice', {
    id: 'user-alice',
    name: 'Alice',
    role: 'buyer',
    joinedAt: new Date().toISOString(),
  });

  storage.set('payment:tx-001', {
    id: 'tx-001',
    from: 'user-alice',
    to: 'agent-dev-02',
    amount: 2000,
    status: 'completed',
  });

  // Log custom events
  storage.appendLog({
    type: 'transaction:payment',
    action: 'payment_received',
    agentId: 'agent-dev-02',
    entityId: 'tx-001',
    entityType: 'payment',
    data: {
      amount: 2000,
      from: 'user-alice',
      service: 'API Development',
    },
    status: 'success',
  });

  storage.appendLog({
    type: 'service:completion',
    action: 'gig_completed',
    agentId: 'agent-dev-02',
    entityId: 'gig-api-001',
    entityType: 'gig',
    data: {
      gigId: 'gig-api-001',
      completionTime: '48 hours',
      qualityScore: 95,
    },
    status: 'success',
  });

  storage.appendLog({
    type: 'system:error',
    action: 'payment_retry',
    entityId: 'tx-002',
    entityType: 'payment',
    data: {
      reason: 'Insufficient balance',
      retryCount: 1,
    },
    status: 'error',
    error: 'Payment failed',
  });

  console.log('✓ Logged various events');

  // View audit trail
  console.log('\n📊 Audit Trail:');
  const allLogs = storage.getLogs({ limit: 10 });
  for (const log of allLogs) {
    const status = log.status === 'success' ? '✓' : '✗';
    console.log(`   ${status} [${log.type}] ${log.action} - ${log.entityId}`);
  }

  // Filter logs by type
  const paymentLogs = storage.getLogs({ type: 'transaction:payment' });
  console.log(`\n💰 Payment transactions: ${paymentLogs.length}`);

  // Filter logs by status
  const errors = storage.getLogs({ status: 'error' });
  console.log(`❌ Errors in audit trail: ${errors.length}`);

  // Agent-specific logs
  const agentLogs = storage.getLogs({ agentId: 'agent-dev-02' });
  console.log(`🤖 Agent-dev-02 events: ${agentLogs.length}`);
}

// ============================================================================
// EXAMPLE 5: Export/Import and Backup
// ============================================================================

export function exampleBackup() {
  console.log('\n💾 Example 5: Backup and Recovery\n');

  // Create and populate storage
  const storage1 = new StorageService();
  storage1.set('agent:luna', { name: 'Luna', role: 'planner' });
  storage1.set('skill:solidity', { name: 'Solidity', version: '2.1.0' });
  storage1.set('gig:sc-001', { title: 'Smart Contract Audit', price: 5000 });

  storage1.appendLog({
    type: 'backup:test',
    action: 'test_backup',
    entityType: 'other',
    data: { test: true },
    status: 'success',
  });

  // Export backup
  const backup = storage1.export();
  console.log(`✓ Exported backup:`);
  console.log(`   Entries: ${backup.entries.length}`);
  console.log(`   Logs: ${backup.logs.length}`);
  console.log(`   Size: ${backup.stats.totalSize} bytes`);

  // Create new storage and restore
  const storage2 = new StorageService();
  storage2.import(backup);

  console.log(`✓ Restored from backup`);

  // Verify restored data
  const restored = storage2.get<{ name: string }>('agent:luna');
  console.log(`✓ Verified: ${restored?.name}`);

  // Export as JSON for storage/versioning
  console.log('\n📄 Full backup data (JSON format):', JSON.stringify(backup, null, 2).substring(0, 200) + '...');
}

// ============================================================================
// EXAMPLE 6: Namespace Management
// ============================================================================

export function exampleNamespaces() {
  console.log('\n🗂️  Example 6: Namespace Management\n');

  const storage = new StorageService();

  // Agent namespace
  storage.setNamespace('agent');
  storage.set('luna:memory', { conversations: [] });
  storage.set('max:memory', { tasksCompleted: 10 });

  console.log('✓ Stored in "agent" namespace');

  // Skill namespace
  storage.setNamespace('skill');
  storage.set('solidity', { version: '2.1.0' });
  storage.set('testing', { version: '1.5.0' });

  console.log('✓ Stored in "skill" namespace');

  // Gig namespace
  storage.setNamespace('gig');
  storage.set('audit', { title: 'Smart Contract Audit' });
  storage.set('development', { title: 'API Development' });

  console.log('✓ Stored in "gig" namespace');

  // View all keys
  const allKeys = storage.keys();
  console.log(`\n📚 All stored keys (${allKeys.length}):`);
  allKeys.forEach(key => console.log(`   • ${key}`));
}

// ============================================================================
// MAIN: Run All Examples
// ============================================================================

export async function runStorageExamples() {
  console.log('\n' + '='.repeat(70));
  console.log('STORAGE SERVICE EXAMPLES');
  console.log('='.repeat(70));

  try {
    exampleAgentMemory();
    exampleSkillStorage();
    exampleGigStorage();
    exampleAuditTrail();
    exampleBackup();
    exampleNamespaces();

    console.log('\n' + '='.repeat(70));
    console.log('✅ All examples completed successfully!');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runStorageExamples().catch(console.error);
}
