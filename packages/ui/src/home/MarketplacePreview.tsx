'use client';

import Link from 'next/link';
import { ArrowRight, Star, Bot, User, Clock, Layers, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

function ServicePreviewCard({ service }: { service: any }) {
  const isAI = service.sellerType === 'agent';
  const providerName = service.sellerEns || service.sellerWallet?.slice(0, 8) || 'Unknown';
  const initials = isAI ? 'AI' : providerName.slice(0, 2).toUpperCase();
  
  // Hardcoded for demo/preview based on ID or random if not present
  const tier = service.tier || (Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 2 : 1);

  return (
    <div className="card hover:border-[var(--color-accent-hover)] transition-all duration-300" style={{ padding: '1.25rem', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      
      {/* Tier Badge Background Glow for Tier 3 */}
      {tier === 3 && (
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(255,0,110,0.2) 0%, transparent 70%)', zIndex: 0 }} />
      )}

      {/* Provider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar" style={{
            width: '28px', height: '28px', fontSize: '11px',
            background: isAI ? 'var(--color-accent-dim)' : 'var(--color-surface-raised)',
            color: isAI ? 'var(--color-accent-hover)' : 'var(--color-ink-secondary)',
            border: `1px solid ${isAI ? 'rgba(99,102,241,0.2)' : 'var(--color-border)'}`,
          }}>
            {isAI ? <Bot size={12} /> : initials}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-secondary)' }}>
            {providerName}
          </span>
        </div>
        
        {/* Tier Badge */}
        {tier === 3 ? (
          <span className="tag" style={{ fontSize: '10px', background: 'rgba(255,0,110,0.1)', color: '#FF006E', border: '1px solid rgba(255,0,110,0.2)' }}>
            <Zap size={10} style={{ display: 'inline', marginRight: '3px' }}/> Tier 3: Harness
          </span>
        ) : tier === 2 ? (
          <span className="tag" style={{ fontSize: '10px', background: 'rgba(157,78,221,0.1)', color: '#9D4EDD', border: '1px solid rgba(157,78,221,0.2)' }}>
            <Layers size={10} style={{ display: 'inline', marginRight: '3px' }}/> Tier 2: MoA
          </span>
        ) : (
          <span className="tag" style={{ fontSize: '10px' }}>Tier 1: Solo</span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)', lineHeight: 1.4, marginBottom: '16px', position: 'relative', zIndex: 1 }}>
        {service.title || service.gigId}
      </h3>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{service.averageRating || 0}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>({service.totalOrders || 0})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-ink-tertiary)' }}>
            <Clock size={11} />
            <span style={{ fontSize: '12px' }}>{service.deliveryTimeHours || 24}h</span>
          </div>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-primary)' }}>
          {service.price || '0.00'} USDC
        </span>
      </div>
    </div>
  );
}

export function MarketplacePreview() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking featured services for demo
    setServices([
      { gigId: 'g1', title: 'Full Smart Contract Audit & Optimization', sellerType: 'agent', sellerEns: 'audit-swarm.eth', price: '500', tier: 3, averageRating: 4.9, totalOrders: 12 },
      { gigId: 'g2', title: 'Deep Market Research Report (Web3 AI)', sellerType: 'agent', sellerEns: 'research-moa.eth', price: '150', tier: 2, averageRating: 4.8, totalOrders: 45 },
      { gigId: 'g3', title: 'Solidity Code Review', sellerType: 'human', sellerEns: '0xdev.eth', price: '50', tier: 1, averageRating: 5.0, totalOrders: 89 },
      { gigId: 'g4', title: 'Decentralized Architecture Blueprint', sellerType: 'agent', sellerEns: 'architect-team.eth', price: '800', tier: 3, averageRating: 4.95, totalOrders: 7 },
    ]);
    setLoading(false);
  }, []);

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container-app">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="text-label" style={{ marginBottom: '10px' }}>Marketplace</p>
            <h2 className="text-heading">Top Autonomous Services</h2>
          </div>
          <Link href="/explore" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-ink-tertiary)' }}>Loading featured services from 0G Storage...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-ink-tertiary)' }}>No services found. Check back later!</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {services.map(s => (
              <ServicePreviewCard key={s.gigId} service={s} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}