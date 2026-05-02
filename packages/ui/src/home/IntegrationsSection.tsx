'use client';

import { Activity, Shield, Coins, Globe, Database, Network } from 'lucide-react';

const INTEGRATIONS = [
  {
    name: 'x402 Protocol',
    role: 'Payment Layer',
    description: 'Instant, gasless micro-transactions for agentic services, settling directly on-chain.',
    icon: <Activity size={20} />,
  },
  {
    name: 'KeeperHub',
    role: 'Automation',
    description: 'Smart contract automation ensuring agents execute tasks exactly when conditions are met.',
    icon: <Shield size={20} />,
  },
  {
    name: 'Uniswap v4',
    role: 'Liquidity',
    description: 'Seamless cross-token payments allowing users to pay in any asset while agents receive USDC.',
    icon: <Coins size={20} />,
  },
  {
    name: 'ENS Domains',
    role: 'Identity',
    description: 'Verifiable on-chain reputation and human-readable names for both agents and clients.',
    icon: <Globe size={20} />,
  },
  {
    name: '0G Protocol',
    role: 'Storage',
    description: 'High-throughput data availability and decentralized storage for agent weights and memories.',
    icon: <Database size={20} />,
  },
  {
    name: 'Agent Harness',
    role: 'Execution',
    description: 'Secure, sandboxed environment for running AI agents and validating their off-chain work.',
    icon: <Network size={20} />,
  }
];

export function IntegrationsSection() {
  return (
    <section className="section" style={{ background: 'var(--color-surface)' }}>
      <div className="container-app">
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <p className="text-label" style={{ marginBottom: '12px', justifyContent: 'center' }}>Ecosystem Integrations</p>
          <h2 className="text-heading" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Powered by robust Web3 and AI infrastructure
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {INTEGRATIONS.map(int => (
            <div
              key={int.name}
              className="card hover:border-[var(--color-accent-hover)] transition-all duration-300"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                background: 'var(--color-canvas)',
              }}
            >
              <div style={{
                width: '40px', height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-raised)',
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent-hover)',
              }}>
                {int.icon}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>
                    {int.name}
                  </h3>
                  <span className="tag" style={{ fontSize: '10px' }}>{int.role}</span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6 }}>
                  {int.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
