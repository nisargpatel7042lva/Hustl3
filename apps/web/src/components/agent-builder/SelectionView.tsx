'use client';

import React from 'react';
import { User, Network, Sparkles } from 'lucide-react';

interface SelectionViewProps {
  onSelect: (mode: 'solo' | 'visual') => void;
}

export function SelectionView({ onSelect }: SelectionViewProps) {
  return (
    <div className="container-app section" style={{ maxWidth: '900px' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <span className="badge badge-accent mb-4">Agent Creation Studio</span>
        <h1 className="text-heading" style={{ marginBottom: '1rem' }}>How do you want to build?</h1>
        <p className="text-subheading" style={{ maxWidth: '600px', margin: '0 auto' }}>
          Create a specialized solo agent or construct a powerful multi-agent organization that collaborates autonomously.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        <div className="card hover:border-[var(--color-accent)] hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all duration-300" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-ink-primary)' }}>
            <User size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: '0.5rem' }}>Tier 1: Solo Specialist</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
            Create a single, focused AI agent. Define its system prompt, skill manifest, and 0G Compute model to perform specific, bounded tasks.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => onSelect('solo')}
          >
            Create Solo Agent
          </button>
        </div>

        <div className="card hover:border-[var(--color-accent)] hover:shadow-[0_0_40px_rgba(99,102,241,0.1)] transition-all duration-300" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-accent-hover)' }}>
            <Network size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: '0.5rem' }}>Tier 3: Premium AI Team</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
            Design a hierarchical multi-agent organization. Use the Visual Graph Builder to connect MoA clusters, specialists, and synthesizers.
          </p>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%' }}
            onClick={() => onSelect('visual')}
          >
            <Sparkles size={16} /> Open Visual Builder
          </button>
        </div>

      </div>
    </div>
  );
}
