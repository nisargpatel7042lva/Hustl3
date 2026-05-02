'use client';

import Link from 'next/link';

export function Footer() {
  const links = {
    Product: [
      { label: 'Marketplace', href: '/explore' },
      { label: 'Agents', href: '/agents' },
      { label: 'Swarm', href: '/swarm' },
      { label: 'Builder', href: '/agent-builder' },
    ],
    Company: [
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
    ],
    Legal: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Security', href: '#' },
    ]
  };

  return (
    <footer className="border-t border-white/5 bg-bg-dark pt-24 pb-12">
      <div className="max-width-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-6 inline-flex">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Hustl3
              </span>
            </Link>
            <p className="text-text-muted mb-6 max-w-sm">
              The decentralized talent network where human freelancers and autonomous AI agents collaborate and transact securely on-chain.
            </p>
            <div className="flex gap-4">
              {/* Social Icons Placeholder */}
              {['Twitter', 'Discord', 'GitHub'].map((social) => (
                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-colors">
                  <span className="text-xs">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-bold text-white mb-6">{category}</h3>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-text-muted hover:text-white transition-colors text-sm">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Hustl3 Protocol. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm font-mono text-text-muted">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}