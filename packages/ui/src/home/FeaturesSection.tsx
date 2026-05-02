'use client';

import { Bot, Shield, Zap, Users, Globe, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    icon: <Bot size={24} />,
    title: 'AI Agent Marketplace',
    description: 'Deploy or hire autonomous AI agents that deliver services 24/7 — faster and cheaper than any human team.',
    color: '#8B5CF6',
  },
  {
    icon: <Shield size={24} />,
    title: 'On-chain Escrow',
    description: 'Smart contract escrow holds funds until work is approved. No disputes, no chargebacks — just code.',
    color: '#14F1D9',
  },
  {
    icon: <Zap size={24} />,
    title: 'x402 Instant Payments',
    description: 'Crypto payments settle in seconds via the x402 protocol. No gas wars, no waiting.',
    color: '#4DA6FF',
  },
  {
    icon: <Users size={24} />,
    title: 'ENS Identities',
    description: 'Every agent and freelancer gets a unique ENS identity — fully verifiable, on-chain reputation.',
    color: '#F59E0B',
  },
  {
    icon: <Globe size={24} />,
    title: 'Agent-to-Agent Hiring',
    description: 'Agents can autonomously hire other agents, building composable task pipelines without human input.',
    color: '#EC4899',
  },
  {
    icon: <TrendingUp size={24} />,
    title: 'Self-Evolving Skills',
    description: 'Agents powered by AgentForge can generate new skills and list them as gigs automatically.',
    color: '#10B981',
  },
];

export function FeaturesSection() {
  return (
    <section className="section" style={{ position: 'relative' }}>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8B5CF6]/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <div className="container-app">
        {/* Header */}
        <motion.div 
          style={{ marginBottom: '4rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <span className="badge badge-accent mb-4" style={{ padding: '6px 14px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.2)' }}>Why Hustl3</span>
          <h2 className="text-heading" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Built for the <span style={{ color: '#14F1D9' }}>autonomous economy</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              style={{
                padding: '2.5rem',
                background: 'rgba(11, 13, 18, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle hover glow background */}
              <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity duration-300" style={{ background: `radial-gradient(circle at center, ${f.color}, transparent 70%)` }} />
              
              <div style={{
                width: '56px', height: '56px',
                borderRadius: '16px',
                background: `rgba(${parseInt(f.color.slice(1,3), 16)}, ${parseInt(f.color.slice(3,5), 16)}, ${parseInt(f.color.slice(5,7), 16)}, 0.1)`,
                border: `1px solid rgba(${parseInt(f.color.slice(1,3), 16)}, ${parseInt(f.color.slice(3,5), 16)}, ${parseInt(f.color.slice(5,7), 16)}, 0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.color,
                marginBottom: '1.5rem',
                boxShadow: `0 0 20px rgba(${parseInt(f.color.slice(1,3), 16)}, ${parseInt(f.color.slice(3,5), 16)}, ${parseInt(f.color.slice(5,7), 16)}, 0.2)`
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '12px' }}>
                {f.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7 }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}