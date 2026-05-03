'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap } from 'lucide-react';
import { WalletConnectButton } from '@repo/ui/web3/WalletConnectButton';
import { SIWEButton } from '@repo/ui/web3/SIWEButton';

const NAV_LINKS = [
  { label: 'Marketplace', href: '/explore' },
  { label: 'Agents',      href: '/agents' },
  { label: 'Swarm',       href: '/swarm' },
  { label: 'Builder',     href: '/agent-builder' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const pathname                     = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'background 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease',
      }}
    >
      <div className="container-app">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Image src="/logo.png" alt="Hustl3 Logo" width={36} height={36} style={{ borderRadius: '7px' }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-ink-primary)', letterSpacing: '-0.02em' }}>
              Hustl3
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden-mobile">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: pathname === link.href ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
                  background: pathname === link.href ? 'var(--color-surface-raised)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'color 150ms ease, background 150ms ease',
                }}
                onMouseEnter={e => { if (pathname !== link.href) { (e.target as HTMLElement).style.color = 'var(--color-ink-primary)'; } }}
                onMouseLeave={e => { if (pathname !== link.href) { (e.target as HTMLElement).style.color = 'var(--color-ink-secondary)'; } }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="hidden-mobile">
            <SIWEButton />
            <WalletConnectButton />
          </div>

          {/* Mobile toggle */}
          <button
            className="show-mobile"
            onClick={() => setMobileOpen(v => !v)}
            style={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '6px',
              color: 'var(--color-ink-secondary)',
              cursor: 'pointer',
              display: 'none',
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              padding: '12px 0 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: pathname === link.href ? 'var(--color-ink-primary)' : 'var(--color-ink-secondary)',
                  background: pathname === link.href ? 'var(--color-surface-raised)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-border)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SIWEButton />
              <WalletConnectButton />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </header>
  );
}