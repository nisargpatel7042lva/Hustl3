'use client';

const PARTNERS = [
  { name: '0G Protocol', tag: 'Storage + Compute' },
  { name: 'ENS Domains', tag: 'Identity' },
  { name: 'Uniswap',     tag: 'Token Swaps' },
  { name: 'KeeperHub',   tag: 'Automation' },
  { name: 'Gensyn AXL',  tag: 'Agent Comms' },
];

export function TrustBar() {
  return (
    <section style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1.75rem 0' }}>
      <div className="container-app">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <span className="text-label" style={{ whiteSpace: 'nowrap' }}>Powered by</span>
          {PARTNERS.map(p => (
            <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)' }}>{p.name}</span>
              <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', fontWeight: 500 }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}