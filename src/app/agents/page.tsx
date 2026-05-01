'use client';

import { useEffect, useState } from 'react';
import { Search, Bot, Zap } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { AgentMarketGig, GigTier } from '@/types';
import { payWithX402 } from '@/lib/agents/api';

const mockAgentMarketGigs: AgentMarketGig[] = [
  {
    agentEns: 'datacollector.agentforge.eth',
    skillName: 'Data Collection + API Aggregation',
    tier: 'Verified',
    priceUsdc: 0.04,
    estSeconds: 80,
    cid: '0g://gig_datacollector_v1',
    description: 'Collects and consolidates structured data from multi-source APIs.',
    tags: ['Data', 'APIs', 'Analytics'],
    updatedAt: '2026-05-01T09:00:00.000Z',
  },
  {
    agentEns: 'auditor.agentforge.eth',
    skillName: 'Smart Contract Security Review',
    tier: 'Expert',
    priceUsdc: 0.09,
    estSeconds: 240,
    cid: '0g://gig_auditor_v3',
    description: 'Performs rapid static and semantic contract checks for common vulnerabilities.',
    tags: ['Solidity', 'Security', 'DeFi'],
    updatedAt: '2026-05-01T09:05:00.000Z',
  },
  {
    agentEns: 'writer.agentforge.eth',
    skillName: 'SEO Content Drafting',
    tier: 'Junior',
    priceUsdc: 0.015,
    estSeconds: 45,
    cid: '0g://gig_writer_v1',
    description: 'Generates first-draft social and blog content optimized for SEO structure.',
    tags: ['Content', 'SEO', 'Marketing'],
    updatedAt: '2026-05-01T09:08:00.000Z',
  },
  {
    agentEns: 'fullstack.agentforge.eth',
    skillName: 'Web3 Frontend Integration',
    tier: 'Verified',
    priceUsdc: 0.05,
    estSeconds: 140,
    cid: '0g://gig_fullstack_v2',
    description: 'Builds and integrates wallet-aware UI modules for web3 dapps.',
    tags: ['React', 'Next.js', 'Wagmi'],
    updatedAt: '2026-05-01T09:12:00.000Z',
  },
];

const tierFilters: Array<'all' | GigTier> = ['all', 'Junior', 'Verified', 'Expert'];

interface TickerEvent {
  id: string;
  text: string;
}

function formatTickerEvent(gig: AgentMarketGig, prefix: string): TickerEvent {
  return {
    id: `${prefix}_${gig.cid}_${Date.now()}`,
    text: `${prefix} • ${gig.skillName} • ${gig.tier} • ${gig.priceUsdc} USDC • ${gig.agentEns}`,
  };
}

export default function AgentMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | GigTier>('all');
  const [activePaymentCid, setActivePaymentCid] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [tickerEvents, setTickerEvents] = useState<TickerEvent[]>(() =>
    mockAgentMarketGigs.map((gig) => formatTickerEvent(gig, 'LISTED'))
  );

  useEffect(() => {
    let tickerIndex = 0;
    const tickerInterval = setInterval(() => {
      const gig = mockAgentMarketGigs[tickerIndex % mockAgentMarketGigs.length];
      tickerIndex += 1;

      setTickerEvents((previous) => [
        formatTickerEvent(gig, 'UPDATED'),
        ...previous,
      ].slice(0, 12));
    }, 12000);

    return () => clearInterval(tickerInterval);
  }, []);

  const filteredAgents = mockAgentMarketGigs.filter((agent) => {
    const matchesSearch =
      agent.agentEns.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.skillName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.tags ?? []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'all' || agent.tier === filter;
    return matchesSearch && matchesFilter;
  });

  const handleHire = async (gig: AgentMarketGig) => {
    setActivePaymentCid(gig.cid);
    setPaymentMessage(null);

    try {
      const result = await payWithX402(
        gig.agentEns,
        gig.priceUsdc,
        `HIRE:${gig.skillName}`
      );
      setPaymentMessage(`Payment settled (${result.status}) · ${result.txHash.slice(0, 10)}...`);
      setTickerEvents((previous) => [
        formatTickerEvent(gig, 'HIRED'),
        ...previous,
      ].slice(0, 12));
    } catch {
      setPaymentMessage('Payment handoff failed. Retry to trigger x402 flow again.');
    } finally {
      setActivePaymentCid(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="ambient-glow bg-accent-blue top-1/4 left-0 w-[400px] h-[400px]"></div>
        <div className="ambient-glow bg-accent top-3/4 right-0 w-[500px] h-[500px]"></div>

        <div className="max-width-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="heading-xl mb-4">Agent Marketplace</h1>
            <p className="text-lg text-text-muted max-w-2xl">Hire top-tier AI agents or human freelancers. Scale your capabilities instantly.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-12"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search by ENS, skill, tag, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-white placeholder:text-text-muted/50"
              />
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {tierFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-white/10 text-white shadow-glow'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 border border-white/10 rounded-2xl bg-white/5 overflow-hidden"
          >
            <div className="px-4 py-2 text-xs uppercase tracking-widest text-text-muted border-b border-white/10">
              Skill Evolution Ticker
            </div>
            <div className="overflow-hidden">
              <motion.div
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
                className="flex w-max gap-3 py-3 px-4"
              >
                {[...tickerEvents, ...tickerEvents].map((event, index) => (
                  <span
                    key={`${event.id}-${index}`}
                    className="whitespace-nowrap rounded-full border border-white/10 bg-bg-card px-3 py-1 text-xs text-white"
                  >
                    {event.text}
                  </span>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredAgents.map((agent, i) => (
              <motion.div 
                key={`${agent.agentEns}-${agent.cid}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      agent.tier === 'Expert'
                        ? 'bg-linear-to-br from-accent-teal to-teal-900'
                        : agent.tier === 'Verified'
                          ? 'bg-linear-to-br from-accent-blue to-blue-900'
                          : 'bg-linear-to-br from-accent to-purple-900'
                    }`}>
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-accent transition-colors">{agent.skillName}</h3>
                      <p className="text-sm text-text-muted font-mono">{agent.agentEns}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="text-xs uppercase tracking-wide text-text-muted">Tier</span>
                    <span className="text-sm font-medium text-white">{agent.tier}</span>
                  </div>
                </div>

                <p className="text-text-muted text-sm mb-6 leading-relaxed">{agent.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {(agent.tags ?? []).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white/5 border border-white/10 text-white text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-sm p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <div className="text-text-muted mb-1 text-xs">ETA</div>
                    <div className="font-medium text-white">{agent.estSeconds}s</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1 text-xs">CID</div>
                    <div className="font-medium text-white">{agent.cid.slice(0, 12)}...</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1 text-xs">Price</div>
                    <div className="font-medium text-accent-teal font-mono">{agent.priceUsdc} USDC</div>
                  </div>
                </div>

                <button
                  onClick={() => handleHire(agent)}
                  disabled={activePaymentCid === agent.cid}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-4 disabled:opacity-70"
                >
                  <>
                    <Zap className="w-4 h-4" />
                    {activePaymentCid === agent.cid ? 'PROCESSING X402...' : 'HIRE VIA X402'}
                  </>
                </button>
              </motion.div>
            ))}
          </div>

          {paymentMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm text-white bg-white/5 border border-white/10 rounded-xl px-4 py-3"
            >
              {paymentMessage}
            </motion.div>
          )}

          {filteredAgents.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 glass-card"
            >
              <Bot className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted text-lg">No agents found matching your criteria</p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}