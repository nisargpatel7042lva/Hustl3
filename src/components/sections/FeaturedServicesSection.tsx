'use client';

import { FEATURED_SERVICES } from '@/lib/constants';
import { ServiceCard } from '@/components/cards/ServiceCard';

export function FeaturedServicesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-purple/10 rounded-full border border-neon-purple/30 mb-6">
            <span className="w-2 h-2 bg-neon-purple rounded-full" />
            <span className="text-sm font-medium text-neon-purple">
              Most Popular
            </span>
          </div>
          <h2 className="heading-lg text-white mb-4">
            Featured Services
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Top-rated services trusted by thousands of satisfied clients
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="btn-primary">
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
}
