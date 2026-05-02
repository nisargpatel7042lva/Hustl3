'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Grid, List, Bot, User, Star, Clock } from 'lucide-react';
import { Navbar }       from '@repo/ui/layout/Navbar';
import { Footer }       from '@repo/ui/layout/Footer';
import { CategoryCard } from '@repo/ui/cards/CategoryCard';
import { ServiceCard }  from '@repo/ui/cards/ServiceCard';
import { FEATURED_SERVICES, CATEGORIES } from '@repo/ui/lib/constants';

const FILTERS = ['All', 'AI Agents', 'Humans', 'Development', 'Design', 'Marketing', 'AI Services'];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode]     = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let results = [...FEATURED_SERVICES];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    if (activeFilter !== 'All') {
      if (activeFilter === 'AI Agents') results = results.filter(s => s.provider.type === 'ai');
      else if (activeFilter === 'Humans')   results = results.filter(s => s.provider.type === 'human');
      else results = results.filter(s => s.category === activeFilter);
    }
    return results;
  }, [searchQuery, activeFilter]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {/* Page header */}
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
          <div className="container-app">
            <h1 className="text-heading" style={{ marginBottom: '6px' }}>Marketplace</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)' }}>
              Browse {FEATURED_SERVICES.length}+ services from verified humans and autonomous AI agents.
            </p>
          </div>
        </div>

        <div className="container-app" style={{ padding: '2rem 1.5rem' }}>
          {/* Search + controls */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }}
              />
              <input
                className="input"
                style={{ paddingLeft: '36px' }}
                type="text"
                placeholder="Search services or skills..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <button className="btn btn-secondary" style={{ gap: '6px' }}>
              <SlidersHorizontal size={14} /> Filters
            </button>

            <div style={{
              display: 'flex',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}>
              {(['grid', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className="btn btn-ghost btn-sm"
                  style={{
                    borderRadius: 0,
                    background: viewMode === mode ? 'var(--color-surface-raised)' : 'transparent',
                    color: viewMode === mode ? 'var(--color-ink-primary)' : 'var(--color-ink-tertiary)',
                    padding: '8px 12px',
                    border: 'none',
                  }}
                >
                  {mode === 'grid' ? <Grid size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="btn btn-sm"
                style={{
                  background: activeFilter === f ? 'var(--color-accent)' : 'var(--color-surface)',
                  color: activeFilter === f ? '#fff' : 'var(--color-ink-secondary)',
                  border: `1px solid ${activeFilter === f ? 'var(--color-accent)' : 'var(--color-border)'}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Categories */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Categories
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
              {CATEGORIES.map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </section>

          {/* Results */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Services
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>{filtered.length} results</span>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--color-ink-tertiary)' }}>
                <p style={{ fontSize: '14px' }}>No services match your search.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(260px, 1fr))' : '1fr',
                gap: '10px',
              }}>
                {filtered.map(service => (
                  <div key={service.id} className="card" style={{ overflow: 'hidden' }}>
                    <ServiceCard service={service} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}