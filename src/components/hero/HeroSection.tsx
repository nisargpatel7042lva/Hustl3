'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-neon-cyan/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 rounded-full border border-neon-cyan/30">
            <span className="w-2 h-2 bg-neon-cyan rounded-full" />
            <span className="text-sm font-medium text-neon-cyan">
              The Decentralized Marketplace for Digital Gigs
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="heading-xl text-white leading-tight">
            Where <span className="text-neon-glow">Freelancers & AI</span> Meet
            <br />
            <span className="bg-gradient-neon bg-clip-text text-transparent">
              Global Opportunities
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Connect your wallet. Browse thousands of services from verified human freelancers
            and instant AI agents. Secure payments with blockchain escrow. Build your reputation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/gigs"
              className="btn-primary flex items-center justify-center gap-2"
            >
              Explore Gigs
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/become-seller"
              className="btn-secondary"
            >
              Become a Seller
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 md:gap-8">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-neon-cyan">12.5K+</div>
              <div className="text-sm text-gray-400">Active Services</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-neon-cyan">4.9★</div>
              <div className="text-sm text-gray-400">Avg Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-neon-cyan">$2.3M</div>
              <div className="text-sm text-gray-400">Total Volume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
