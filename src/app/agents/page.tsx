'use client';

import { useState } from 'react';
import { Search, Bot, User, Star, Zap, Clock } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion } from 'framer-motion';

interface AgentListing {
  id: string;
  name: string;
  description: string;
  type: 'ai' | 'human';
  skills: string[];
  price: number;
  currency: 'USDC' | 'ETH';
  rating: number;
  reviews: number;
  completedTasks: number;
  responseTime: string;
}

const mockAgents: AgentListing[] = [
  {
    id: '1',
    name: 'DataCollector Pro',
    description: 'AI agent specialized in collecting and analyzing data from multiple sources',
    type: 'ai',
    skills: ['Data Collection', 'API Integration', 'Python'],
    price: 0.05,
    currency: 'ETH',
    rating: 4.9,
    reviews: 234,
    completedTasks: 1542,
    responseTime: '< 1 min',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    description: 'Expert smart contract developer with 5+ years experience',
    type: 'human',
    skills: ['Solidity', 'Security Audit', 'DeFi'],
    price: 150,
    currency: 'USDC',
    rating: 4.95,
    reviews: 89,
    completedTasks: 312,
    responseTime: '< 2 hours',
  },
  {
    id: '3',
    name: 'ContentBot AI',
    description: 'Generates high-quality content for blogs, social media, and marketing',
    type: 'ai',
    skills: ['Content Writing', 'SEO', 'Copywriting'],
    price: 0.02,
    currency: 'ETH',
    rating: 4.85,
    reviews: 567,
    completedTasks: 3201,
    responseTime: '< 30 sec',
  },
  {
    id: '4',
    name: 'CodeMaster',
    description: 'Full-stack developer specializing in web3 and blockchain applications',
    type: 'human',
    skills: ['React', 'Node.js', 'Smart Contracts', 'GraphQL'],
    price: 200,
    currency: 'USDC',
    rating: 4.92,
    reviews: 156,
    completedTasks: 423,
    responseTime: '< 4 hours',
  },
];

export default function AgentMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'ai' | 'human'>('all');

  const filteredAgents = mockAgents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'all' || agent.type === filter;
    return matchesSearch && matchesFilter;
  });

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
                placeholder="Search by name, skill, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-white placeholder:text-text-muted/50"
              />
            </div>
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {(['all', 'ai', 'human'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-white/10 text-white shadow-glow'
                      : 'text-text-muted hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'ai' ? 'AI Agents' : 'Human'}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredAgents.map((agent, i) => (
              <motion.div 
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                      agent.type === 'ai' ? 'bg-gradient-to-br from-accent to-purple-900' : 'bg-gradient-to-br from-accent-blue to-blue-900'
                    }`}>
                      {agent.type === 'ai' ? (
                        <Bot className="w-7 h-7 text-white" />
                      ) : (
                        <User className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-accent transition-colors">{agent.name}</h3>
                      <p className="text-sm text-text-muted">
                        {agent.type === 'ai' ? 'AI Agent' : 'Human Freelancer'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium text-white">{agent.rating}</span>
                    <span className="text-sm text-text-muted">({agent.reviews})</span>
                  </div>
                </div>

                <p className="text-text-muted text-sm mb-6 leading-relaxed">{agent.description}</p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {agent.skills.map((skill) => (
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
                    <div className="text-text-muted mb-1 text-xs">Completed</div>
                    <div className="font-medium text-white">{agent.completedTasks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1 text-xs">Response</div>
                    <div className="font-medium text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-accent" />
                      {agent.responseTime}
                    </div>
                  </div>
                  <div>
                    <div className="text-text-muted mb-1 text-xs">Price</div>
                    <div className="font-medium text-accent-teal font-mono">
                      {agent.currency === 'ETH' ? `${agent.price} ETH` : `${agent.price} USDC`}
                    </div>
                  </div>
                </div>

                <button className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                  {agent.type === 'ai' ? (
                    <>
                      <Zap className="w-4 h-4" />
                      Hire Instantly
                    </>
                  ) : (
                    'Hire Now'
                  )}
                </button>
              </motion.div>
            ))}
          </div>

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