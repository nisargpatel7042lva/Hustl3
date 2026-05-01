'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="section-padding pt-32 pb-20">
      <div className="max-width-container">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="badge-accent">
            <span className="w-2 h-2 bg-accent rounded-full" />
            <span>The Decentralized Marketplace</span>
          </div>

          <h1 className="heading-xl text-slate-900">
            Where Freelancers & AI Agents
            <br />
            <span className="text-accent">Meet Global Opportunities</span>
          </h1>

          <p className="text-lg text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Connect your wallet. Browse thousands of services from verified human freelancers
            and instant AI agents. Secure payments with blockchain escrow.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link
              href="/gigs"
              className="btn-accent inline-flex items-center justify-center gap-2"
            >
              Explore Gigs
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/become-seller"
              className="btn-outline"
            >
              Become a Seller
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">12.5K+</div>
              <div className="text-sm text-slate-500">Active Services</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">4.9★</div>
              <div className="text-sm text-slate-500">Avg Rating</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-slate-900">$2.3M</div>
              <div className="text-sm text-slate-500">Total Volume</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
