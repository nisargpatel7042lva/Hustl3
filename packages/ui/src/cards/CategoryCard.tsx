'use client';

import Link from 'next/link';
import { Icon } from '@repo/ui/ui/Icon';
import type { Category } from '@repo/ui/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.path} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <div
        style={{
          padding: '1.5rem 1rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 150ms ease, background 150ms ease',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-hover)';
          (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-raised)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
        }}
      >
        <div style={{
          width: '36px', height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-accent-hover)',
        }}>
          <Icon name={category.icon} size={16} />
        </div>

        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-primary)', marginBottom: '2px' }}>
            {category.name}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)' }}>
            {category.count.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}