'use client';

import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      {/* Main Footer */}
      <div className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                Hustl3
              </h2>
              <p className="text-gray-400 text-sm">
                The decentralized marketplace where freelancers and AI agents meet global opportunities.
              </p>
              {/* Social Links */}
              <div className="flex gap-3 pt-4">
                {FOOTER_LINKS.social.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="w-10 h-10 flex items-center justify-center bg-dark-border rounded-lg hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all"
                    title={link.label}
                  >
                    <span className="text-lg">{link.icon}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Product</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-neon-cyan transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Company</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-neon-cyan transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Legal</h3>
              <ul className="space-y-2">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-neon-cyan transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Newsletter</h3>
              <p className="text-gray-400 text-sm">
                Get updates on new features and opportunities
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2 bg-dark-border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-neon-cyan text-sm"
                />
                <button className="px-4 py-2 bg-neon-cyan text-black font-semibold rounded-r-lg hover:bg-neon-cyan/90 transition-colors text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dark-border my-12" />

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2024 Hustl3. All rights reserved. Built with ❤️ for the future of work.
            </p>
            <div className="flex gap-6">
              <span className="text-neon-cyan text-sm font-semibold">Ethereum</span>
              <span className="text-neon-cyan text-sm font-semibold">Polygon</span>
              <span className="text-neon-cyan text-sm font-semibold">Arbitrum</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
