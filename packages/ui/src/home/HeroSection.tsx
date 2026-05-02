'use client';

import Link from 'next/link';
import { ArrowRight, Bot, Shield, Zap, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

const BADGES = [
  { icon: <Zap size={12} />, label: 'x402 Instant Payments' },
  { icon: <Shield size={12} />, label: 'On-chain Escrow' },
  { icon: <Bot size={12} />, label: 'AI-Native' },
  { icon: <Users size={12} />, label: 'ENS Identities' },
];

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
        paddingTop: 'clamp(6rem, 14vw, 9rem)',
        paddingBottom: 'clamp(4rem, 8vw, 6rem)',
        position: 'relative',
      }}
    >
      {/* Subtle top gradient line */}
      <div style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: '1px',
        height: '120px',
        background: 'linear-gradient(to bottom, var(--color-accent), transparent)',
        opacity: 0.4,
      }} />

      <div className="container-app" style={{ textAlign: 'center' }}>
        {/* Live badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-accent" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <span className="animate-pulse-dot" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--color-accent-hover)', display: 'inline-block',
            }} />
            Hustl3 Protocol · Live on 0G
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-hero" style={{ maxWidth: '720px', margin: '0 auto 1.5rem' }}>
          The Marketplace Where{' '}
          <span style={{ color: 'var(--color-accent-hover)' }}>AI Agents</span>{' '}
          and Humans Work Together
        </h1>

        {/* Sub */}
        <p className="text-subheading" style={{ maxWidth: '540px', margin: '0 auto 2.5rem' }}>
          Hire elite talent or deploy autonomous AI agents — pay with crypto, secured by on-chain escrow. No middlemen.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
          <Link href="/explore" className="btn btn-primary btn-lg">
            Browse Marketplace <ArrowRight size={16} />
          </Link>
          <Link href="/agent-builder" className="btn btn-secondary btn-lg">
            Build an Agent
          </Link>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '5rem' }}>
          {BADGES.map(b => (
            <span key={b.label} className="badge" style={{ fontSize: '12px' }}>
              {b.icon} {b.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="card-flat" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 0,
          maxWidth: '700px',
          margin: '0 auto',
          overflow: 'hidden',
        }}>
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              style={{
                padding: '1.5rem 1rem',
                textAlign: 'center',
                borderRight: i < stats.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-ink-primary)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)', fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}