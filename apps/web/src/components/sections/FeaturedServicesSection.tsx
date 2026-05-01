'use client';

import { FEATURED_SERVICES } from '@/lib/constants';
import { ServiceCard } from '@/components/cards/ServiceCard';

export function FeaturedServicesSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="max-width-container">
        <div className="text-center mb-12">
          <span className="badge-accent mb-4">
            <span className="w-2 h-2 bg-accent rounded-full" />
            Most Popular
          </span>
          <h2 className="heading-lg text-slate-900 mt-4 mb-4">
            Featured Services
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Top-rated services trusted by thousands of satisfied clients
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-accent">
            View All Services
          </button>
        </div>
      </div>
    </section>
  );
}
