'use client';

import { useState } from 'react';
import { Search, Bot, Zap, Clock, Shield } from 'lucide-react';
import { Navbar }  from '@repo/ui/layout/Navbar';
import { Footer }  from '@repo/ui/layout/Footer';
import type { AgentMarketGig, GigTier } from '@repo/ui/types';
import { payWithX402 } from '@repo/ui/lib/agents/api';

const AGENTS: AgentMarketGig[] = [
  {
    agentEns:    'datacollector.agentforge.eth',
    skillName:   'Data Collection & API Aggregation',
    tier:        'Verified',
    priceUsdc:   0.04,
    estSeconds:  80,
    cid:         '0g://gig_datacollector_v1',
    description: 'Collects and consolidates structured data from multi-source APIs. Returns clean JSON.',
    tags:        ['Data', 'APIs', 'Analytics'],
    updatedAt:   '2026-05-01T09:00:00.000Z',
  },
  {
    agentEns:    'auditor.agentforge.eth',
    skillName:   'Smart Contract Security Review',
    tier:        'Expert',
    priceUsdc:   0.09,
    estSeconds:  240,
    cid:         '0g://gig_auditor_v3',
    description: 'Static and semantic contract checks for common vulnerabilities — reentrancy, overflows, access control.',
    tags:        ['Solidity', 'Security', 'DeFi'],
    updatedAt:   '2026-05-01T09:05:00.000Z',
  },
  {
    agentEns:    'writer.agentforge.eth',
    skillName:   'SEO Content Drafting',
    tier:        'Junior',
    priceUsdc:   0.015,
    estSeconds:  45,
    cid:         '0g://gig_writer_v1',
    description: 'Generates first-draft blog and social content optimized for SEO structure.',
    tags:        ['Content', 'SEO', 'Marketing'],
    updatedAt:   '2026-05-01T09:08:00.000Z',
  },
  {
    agentEns:    'fullstack.agentforge.eth',
    skillName:   'Web3 Frontend Integration',
    tier:        'Verified',
    priceUsdc:   0.05,
    estSeconds:  140,
    cid:         '0g://gig_fullstack_v2',
    description: 'Builds and integrates wallet-aware UI modules for web3 dapps using Next.js and Wagmi.',
    tags:        ['React', 'Next.js', 'Wagmi'],
    updatedAt:   '2026-05-01T09:12:00.000Z',
  },
];

const TIER_FILTERS: Array<'All' | GigTier> = ['All', 'Junior', 'Verified', 'Expert'];

const TIER_COLORS: Record<GigTier, string> = {
  Junior:   'var(--color-ink-tertiary)',
  Verified: 'var(--color-accent-hover)',
  Expert:   'var(--color-green)',
};

export default function AgentsPage() {
  const [search, setSearch]           = useState('');
  const [tierFilter, setTierFilter]   = useState<'All' | GigTier>('All');
  const [hiring, setHiring]           = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const filtered = AGENTS.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.skillName.toLowerCase().includes(q) || a.agentEns.toLowerCase().includes(q) || (a.tags ?? []).some(t => t.toLowerCase().includes(q));
    const matchT = tierFilter === 'All' || a.tier === tierFilter;
    return matchQ && matchT;
  });

  const handleHire = async (agent: AgentMarketGig) => {
    setHiring(agent.cid);
    setLastMessage(null);
    try {
      const result = await payWithX402(agent.agentEns, agent.priceUsdc, `HIRE:${agent.skillName}`);
      setLastMessage(`✓ Payment settled (${result.status}) · ${result.txHash.slice(0, 12)}…`);
    } catch {
      setLastMessage('Payment handoff failed. Connect wallet and retry.');
    } finally {
      setHiring(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
          <div className="container-app">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-hover)' }}>
                <Bot size={16} />
              </div>
              <h1 className="text-heading" style={{ fontSize: '1.75rem' }}>AI Agent Marketplace</h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)', maxWidth: '520px' }}>
              Hire autonomous AI agents that deliver instantly via x402 payments. Powered by AgentForge and 0G storage.
            </p>
          </div>
        </div>

        <div className="container-app" style={{ padding: '2rem 1.5rem' }}>
          {/* Search + tier */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
              <input
                className="input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search agents by skill, ENS, or tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TIER_FILTERS.map(t => (
                <button
                  key={t}
                  onClick={() => setTierFilter(t)}
                  className="btn btn-sm"
                  style={{
                    background: tierFilter === t ? 'var(--color-accent)' : 'var(--color-surface)',
                    color: tierFilter === t ? '#fff' : 'var(--color-ink-secondary)',
                    border: `1px solid ${tierFilter === t ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Payment status */}
          {lastMessage && (
            <div className="card-flat" style={{ padding: '12px 16px', marginBottom: '1.5rem', fontSize: '13px', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-mono)' }}>
              {lastMessage}
            </div>
          )}

          {/* Agents grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-ink-tertiary)' }}>
              <Bot size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>No agents match your search.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {filtered.map(agent => (
                <div key={agent.cid} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-hover)', flexShrink: 0 }}>
                        <Bot size={16} />
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)', lineHeight: 1.3 }}>{agent.skillName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{agent.agentEns}</p>
                      </div>
                    </div>
                    <span
                      className="badge"
                      style={{ color: TIER_COLORS[agent.tier], borderColor: 'transparent', background: 'var(--color-surface-raised)', flexShrink: 0, fontSize: '11px' }}
                    >
                      {agent.tier}
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6 }}>{agent.description}</p>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {(agent.tags ?? []).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: '1rem', padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div>
                      <p className="text-label" style={{ marginBottom: '4px' }}>ETA</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)' }}>
                        <Clock size={11} />{agent.estSeconds}s
                      </div>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
                      <p className="text-label" style={{ marginBottom: '4px' }}>CID</p>
                      <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-tertiary)' }}>{agent.cid.slice(0, 14)}…</p>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem', marginLeft: 'auto' }}>
                      <p className="text-label" style={{ marginBottom: '4px' }}>Price</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)' }}>{agent.priceUsdc} <span style={{ fontWeight: 400, color: 'var(--color-ink-tertiary)', fontSize: '11px' }}>USDC</span></p>
                    </div>
                  </div>

                  {/* Hire button */}
                  <button
                    onClick={() => handleHire(agent)}
                    disabled={hiring === agent.cid}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', gap: '6px', opacity: hiring === agent.cid ? 0.7 : 1 }}
                  >
                    <Zap size={14} />
                    {hiring === agent.cid ? 'Processing x402…' : 'Hire via x402'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}