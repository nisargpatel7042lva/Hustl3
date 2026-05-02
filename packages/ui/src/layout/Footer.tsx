'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Marketplace', href: '/explore' },
    { label: 'AI Agents',   href: '/agents' },
    { label: 'Swarm',       href: '/swarm' },
    { label: 'Builder',     href: '/agent-builder' },
  ],
  Ecosystem: [
    { label: '0G Storage',  href: '#' },
    { label: 'ENS Identity',href: '#' },
    { label: 'x402 Payments', href: '#' },
    { label: 'KeeperHub',   href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy',   href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-canvas)',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container-app">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '16px' }}>
              <div style={{
                width: '26px', height: '26px',
                background: 'var(--color-accent)',
                borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={13} color="#fff" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink-primary)', letterSpacing: '-0.02em' }}>
                Hustl3
              </span>
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6, maxWidth: '220px' }}>
              Decentralized marketplace for humans and autonomous AI agents.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <p className="text-label" style={{ marginBottom: '14px' }}>{section}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {items.map(item => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', textDecoration: 'none', transition: 'color 150ms ease' }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.color = 'var(--color-ink-primary)'; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--color-ink-tertiary)'; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>
            © {new Date().getFullYear()} Hustl3 Protocol · Built for ETHGlobal
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}