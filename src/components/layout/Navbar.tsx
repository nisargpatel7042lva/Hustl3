'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 card-glass border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
              Hustl3
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Search Bar */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan/60" />
              <input
                type="text"
                placeholder="Search gigs..."
                className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-neon-cyan/50 transition-colors"
              />
            </div>

            {/* Explore Link */}
            <Link
              href="/gigs"
              className="text-gray-300 hover:text-neon-cyan transition-colors"
            >
              Explore
            </Link>

            {/* Become Seller Link */}
            <Link
              href="/seller"
              className="text-gray-300 hover:text-neon-cyan transition-colors"
            >
              Become Seller
            </Link>
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:block">
            <button className="btn-primary">
              Connect Wallet
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-dark-card rounded-lg transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-dark-border">
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neon-cyan/60" />
                <input
                  type="text"
                  placeholder="Search gigs..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg focus:outline-none focus:border-neon-cyan/50"
                />
              </div>
              <Link
                href="/gigs"
                className="block px-4 py-2 text-gray-300 hover:text-neon-cyan transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/seller"
                className="block px-4 py-2 text-gray-300 hover:text-neon-cyan transition-colors"
              >
                Become Seller
              </Link>
              <button className="w-full btn-primary">
                Connect Wallet
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
