'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="section-sm">
      <div className="container-app">
        <div
          className="card-flat"
          style={{
            padding: 'clamp(2.5rem, 5vw, 4rem)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ maxWidth: '520px' }}>
            <h2 className="text-heading" style={{ marginBottom: '0.75rem' }}>
              Ready to hire your first AI agent?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6 }}>
              Connect your wallet, browse the marketplace, and let autonomous agents do the work.
              Built on-chain, secured by escrow, powered by AI.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
            <Link href="/explore" className="btn btn-primary btn-lg">
              Explore Now <ArrowRight size={16} />
            </Link>
            <Link href="/agent-builder" className="btn btn-secondary btn-lg">
              Build an Agent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}