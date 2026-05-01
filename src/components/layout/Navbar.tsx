'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Search } from 'lucide-react';
import { WalletConnectButton } from '@/components/web3/WalletConnectButton';
import { EnsLookupPanel } from '@/components/web3/EnsLookupPanel';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isEnsLookupOpen, setIsEnsLookupOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg-dark/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-width-container">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-accent-blue flex items-center justify-center shadow-glow group-hover:shadow-glow-blue transition-all duration-300">
              <span className="text-white font-bold text-lg leading-none">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/70 transition-all duration-300">
              Hustl3
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/explore" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Marketplace
            </Link>
            <Link href="/agents" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Agents
            </Link>
            <Link href="/swarm" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Swarm
            </Link>
            <Link href="/agent-builder" className="text-sm font-medium text-text-muted hover:text-white transition-colors">
              Builder
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setIsEnsLookupOpen((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-300"
              aria-label="Toggle ENS lookup"
            >
              <Search className="w-4 h-4" />
            </button>
            <WalletConnectButton />
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isOpen ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        <AnimatePresence>
          {isEnsLookupOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block mt-4 max-w-md ml-auto"
            >
              <EnsLookupPanel />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pt-4 border-t border-white/5 overflow-hidden"
            >
              <div className="flex flex-col space-y-4 pb-4">
                <Link href="/explore" className="text-base font-medium text-text-muted hover:text-white">Marketplace</Link>
                <Link href="/agents" className="text-base font-medium text-text-muted hover:text-white">Agents</Link>
                <Link href="/swarm" className="text-base font-medium text-text-muted hover:text-white">Swarm</Link>
                <Link href="/agent-builder" className="text-base font-medium text-text-muted hover:text-white">Builder</Link>
                <EnsLookupPanel compact />
                <div className="pt-4 border-t border-white/5 flex justify-center">
                  <WalletConnectButton />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}