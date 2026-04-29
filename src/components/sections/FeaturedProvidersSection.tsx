'use client';

import { FEATURED_FREELANCERS, FEATURED_AI_AGENTS } from '@/lib/constants';
import { ProviderCard } from '@/components/cards/ProviderCard';

export function FeaturedProvidersSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Human Freelancers */}
        <div>
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              Top Human Freelancers
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Verified experts delivering your vision with precision and care
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_FREELANCERS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

        {/* AI Agents */}
        <div>
          <div className="text-center mb-12">
            <h2 className="heading-lg text-white mb-4">
              Instant AI Agents
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Get results instantly with advanced AI, available 24/7
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_AI_AGENTS.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <button className="btn-primary">
            Discover All Sellers
          </button>
        </div>
      </div>
    </section>
  );
}
