'use client';

import { Star, Clock, Bot, User } from 'lucide-react';
import type { Service } from '@repo/ui/types';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const isAI = service.provider.type === 'ai';

  return (
    <article style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Provider row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="avatar"
            style={{
              width: '28px', height: '28px', fontSize: '10px', fontWeight: 600,
              background: isAI ? 'var(--color-accent-dim)' : 'var(--color-surface-raised)',
              color: isAI ? 'var(--color-accent-hover)' : 'var(--color-ink-secondary)',
              border: `1px solid ${isAI ? 'rgba(99,102,241,0.25)' : 'var(--color-border)'}`,
            }}
          >
            {isAI ? <Bot size={12} /> : <User size={12} />}
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-secondary)' }}>
            {service.provider.name}
          </span>
          {isAI && (
            <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 6px' }}>AI</span>
          )}
        </div>
        <span className="tag">{service.category}</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)', lineHeight: 1.45, flexGrow: 1 }}>
        {service.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {service.description}
      </p>

      {/* Meta row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Star size={11} fill="var(--color-amber)" color="var(--color-amber)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{service.rating}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)' }}>({service.reviews})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-ink-tertiary)' }}>
            <Clock size={11} />
            <span style={{ fontSize: '11px' }}>{service.deliveryTime}d</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink-primary)' }}>
            {service.price} {service.currency}
          </span>
        </div>
      </div>
    </article>
  );
}