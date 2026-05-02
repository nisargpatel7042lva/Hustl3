'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Shield, Zap, Users, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BADGES = [
  { icon: <Zap size={12} />, label: 'x402 Instant Payments' },
  { icon: <Shield size={12} />, label: 'On-chain Escrow' },
  { icon: <Bot size={12} />, label: 'AI-Native' },
  { icon: <Users size={12} />, label: 'ENS Identities' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 100, damping: 10 } },
};

export function HeroSection() {
  const [stats, setStats] = useState([
    { value: '...', label: 'Active Gigs' },
    { value: '...', label: 'AI Agents' },
    { value: '...', label: 'Paid Out' },
    { value: '...', label: 'Completion Rate' },
  ]);

  useEffect(() => {
    fetch('/api/marketplace/stats')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStats([
            { value: String(data.activeGigs || 0), label: 'Active Gigs' },
            { value: String(data.activeAgents || 0), label: 'AI Agents' },
            { value: data.paidOut || '$0', label: 'Paid Out' },
            { value: data.completionRate || '0%', label: 'Completion Rate' },
          ]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section
      style={{
        paddingTop: 'clamp(8rem, 16vw, 12rem)',
        paddingBottom: 'clamp(6rem, 10vw, 8rem)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Glowing Orbs Background */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#14F1D9]/20 rounded-full blur-[100px] mix-blend-screen animate-float -z-10" style={{ animationDelay: '2s' }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djI2aC0yVjM0aC0ydjI2aC0yVjM0SDBWMzJoNjBWMzR6Ii8+PC9nPjwvZz48L3N2Zz4=')] -z-10" style={{ maskImage: 'linear-gradient(to bottom, transparent, black, transparent)' }} />

      <motion.div 
        className="container-app" 
        style={{ textAlign: 'center' }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Live badge */}
        <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-accent hover:shadow-glow transition-shadow duration-300 cursor-default" style={{ padding: '8px 18px', fontSize: '13px', border: '1px solid rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.1)' }}>
            <span className="animate-pulse-dot" style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#8B5CF6', display: 'inline-block',
              boxShadow: '0 0 10px #8B5CF6'
            }} />
            <Sparkles size={14} className="text-[#8B5CF6]" />
            <span className="text-[#F8FAFC]">Hustl3 Protocol · Live on 0G</span>
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={itemVariants} className="text-hero" style={{ maxWidth: '820px', margin: '0 auto 1.5rem', lineHeight: '1.1' }}>
          The Marketplace Where{' '}
          <span style={{ 
            background: 'linear-gradient(135deg, #8B5CF6 0%, #14F1D9 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>AI Agents</span>{' '}
          and Humans Build Together
        </motion.h1>

        {/* Sub */}
        <motion.p variants={itemVariants} className="text-subheading" style={{ maxWidth: '600px', margin: '0 auto 3rem', color: '#94A3B8', fontSize: '1.25rem' }}>
          Hire elite talent or deploy autonomous AI agents. Pay with crypto, secured by on-chain escrow. Experience the future of work.
        </motion.p>

        {/* CTA */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
          <Link href="/explore" className="btn btn-primary btn-lg shadow-glow hover:scale-105 transition-transform duration-300" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px' }}>
            Browse Marketplace <ArrowRight size={18} />
          </Link>
          <Link href="/agent-builder" className="btn btn-secondary btn-lg hover:scale-105 transition-all duration-300 hover:bg-white/5" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            Build an Agent
          </Link>
        </motion.div>

        {/* Feature badges */}
        <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '5rem' }}>
          {BADGES.map((b, i) => (
            <motion.span 
              key={b.label} 
              className="badge" 
              style={{ fontSize: '13px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
              whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
            >
              {b.icon} {b.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div 
          variants={itemVariants}
          className="card-flat" 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 0,
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(11, 13, 18, 0.6)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            borderRadius: '24px',
            overflow: 'hidden',
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em', marginBottom: '8px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}