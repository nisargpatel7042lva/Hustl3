'use client';

import Link from 'next/link';
import { ArrowRight, Star, Bot, User, Clock } from 'lucide-react';

const PREVIEW_SERVICES = [
  {
    id: '1',
    title: 'NFT Smart Contract Development',
    category: 'Development',
    price: '5.5 ETH',
    rating: 4.95,
    reviews: 156,
    delivery: '5 days',
    provider: { name: 'Marcus W.', type: 'human' as const, initials: 'MW' },
    featured: true,
  },
  {
    id: '2',
    title: 'AI-Generated Product Image Pack (100 imgs)',
    category: 'AI Services',
    price: '0.8 ETH',
    rating: 4.88,
    reviews: 423,
    delivery: '1 hour',
    provider: { name: 'DesignMaster AI', type: 'ai' as const, initials: 'AI' },
    featured: true,
  },
  {
    id: '3',
    title: 'Full Website Redesign (Web3 UI)',
    category: 'Design',
    price: '3.2 ETH',
    rating: 4.92,
    reviews: 89,
    delivery: '7 days',
    provider: { name: 'Sarah C.', type: 'human' as const, initials: 'SC' },
    featured: false,
  },
  {
    id: '4',
    title: 'SEO Content Strategy & Calendar',
    category: 'Marketing',
    price: '1,200 USDC',
    rating: 4.85,
    reviews: 234,
    delivery: '3 days',
    provider: { name: 'ContentFlow AI', type: 'ai' as const, initials: 'CF' },
    featured: false,
  },
];

function ServicePreviewCard({ service }: { service: typeof PREVIEW_SERVICES[0] }) {
  const isAI = service.provider.type === 'ai';

  return (
    <div className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
      {/* Provider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar" style={{
            width: '28px', height: '28px', fontSize: '11px',
            background: isAI ? 'var(--color-accent-dim)' : 'var(--color-surface-raised)',
            color: isAI ? 'var(--color-accent-hover)' : 'var(--color-ink-secondary)',
            border: `1px solid ${isAI ? 'rgba(99,102,241,0.2)' : 'var(--color-border)'}`,
          }}>
            {isAI ? <Bot size={12} /> : service.provider.initials}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-secondary)' }}>
            {service.provider.name}
          </span>
        </div>
        <span className="tag" style={{ fontSize: '11px' }}>{service.category}</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)', lineHeight: 1.4, marginBottom: '16px' }}>
        {service.title}
      </h3>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{service.rating}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>({service.reviews})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-ink-tertiary)' }}>
            <Clock size={11} />
            <span style={{ fontSize: '12px' }}>{service.delivery}</span>
          </div>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-primary)' }}>
          {service.price}
        </span>
      </div>
    </div>
  );
}

export function MarketplacePreview() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container-app">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p className="text-label" style={{ marginBottom: '10px' }}>Marketplace</p>
            <h2 className="text-heading">Top services right now</h2>
          </div>
          <Link href="/explore" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {PREVIEW_SERVICES.map(s => (
            <ServicePreviewCard key={s.id} service={s} />
          ))}
        </div>
      </div>
    </section>
  );
}