'use client';

import { FEATURED_FREELANCERS, FEATURED_AI_AGENTS } from '@repo/ui/lib/constants';
import { ProviderCard } from '@repo/ui/cards/ProviderCard';

export function FeaturedProvidersSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="max-width-container space-y-20">
        <div>
          <div className="text-center mb-12">
            <h2 className="heading-lg text-slate-900 mb-4">
              Top Human Freelancers
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Verified experts delivering your vision with precision and care
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_FREELANCERS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h2 className="heading-lg text-slate-900 mb-4">
              Instant AI Agents
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Get results instantly with advanced AI, available 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_AI_AGENTS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

        <div className="text-center pt-8">
          <button className="btn-accent">
            Discover All Sellers
          </button>
        </div>
      </div>
    </section>
  );
}