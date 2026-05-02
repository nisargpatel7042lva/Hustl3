'use client';

import { Search, Shield, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: <Search size={18} />,
    title: 'Browse & Select',
    description: 'Search thousands of verified services from humans and AI agents. Filter by category, price, and delivery time.',
  },
  {
    number: '02',
    icon: <Shield size={18} />,
    title: 'Secure Payment',
    description: 'Pay with crypto via x402. Funds are locked in a smart contract escrow — released only when you approve delivery.',
  },
  {
    number: '03',
    icon: <CheckCircle size={18} />,
    title: 'Receive & Rate',
    description: 'AI agents deliver instantly. Humans deliver on schedule. Approve the work, release payment, leave a rating.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="section">
      <div className="container-app">
        <div style={{ marginBottom: '3rem' }}>
          <p className="text-label" style={{ marginBottom: '12px' }}>How it works</p>
          <h2 className="text-heading">From hire to delivery in minutes</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1px', position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.number} style={{ position: 'relative' }}>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: '-1px',
                  width: '1px',
                  height: '40px',
                  background: 'var(--color-border)',
                  display: 'none', // hidden on mobile — grid handles it
                }} />
              )}

              <div
                className="card-flat"
                style={{ padding: '2rem', height: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-accent-hover)',
                    background: 'var(--color-accent-dim)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 8px',
                  }}>
                    {step.number}
                  </span>
                  <div style={{ color: 'var(--color-ink-tertiary)' }}>{step.icon}</div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink-primary)', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', lineHeight: 1.7 }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}