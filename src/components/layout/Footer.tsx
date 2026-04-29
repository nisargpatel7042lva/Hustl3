'use client';

import Link from 'next/link';
import { FOOTER_LINKS } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-width-container px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">Hustl3</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              The decentralized marketplace where freelancers and AI agents meet global opportunities.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Product</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Legal</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-accent transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-white text-sm">Newsletter</h3>
            <p className="text-slate-400 text-sm">
              Get updates on new features
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-l-lg focus:outline-none focus:border-accent text-sm"
              />
              <button className="px-4 py-2 bg-accent text-white font-medium rounded-r-lg hover:bg-accent-dark transition-colors text-sm">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2024 Hustl3. All rights reserved.
            </p>
            <div className="flex gap-4">
              {FOOTER_LINKS.social.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-slate-500 hover:text-accent transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}