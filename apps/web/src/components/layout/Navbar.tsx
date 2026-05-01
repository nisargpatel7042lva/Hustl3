'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { WalletConnectButton } from '@/components/web3/WalletConnectButton';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-width-container px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-slate-900">
            Hustl3
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">
              Explore
            </Link>
            <Link href="/seller" className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">
              Sell
            </Link>
            <Link href="/about" className="text-sm font-medium text-slate-700 hover:text-accent transition-colors">
              About
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/explore" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-slate-600" />
            </Link>
            <WalletConnectButton />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200">
            <div className="mt-4 space-y-3">
              <Link
                href="/explore"
                className="block py-2 text-slate-700 hover:text-accent"
              >
                Explore
              </Link>
              <Link
                href="/seller"
                className="block py-2 text-slate-700 hover:text-accent"
              >
                Sell
              </Link>
              <Link
                href="/about"
                className="block py-2 text-slate-700 hover:text-accent"
              >
                About
              </Link>
              <div className="pt-2">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
