'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/service/${service.id}`}>
      <div className="card-premium h-full group overflow-hidden">
        {/* Service Image */}
        <div className="relative h-40 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 flex items-center justify-center overflow-hidden">
          <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {service.image}
          </div>
          {service.featured && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-neon-cyan/90 text-black text-xs font-bold rounded-full">
              FEATURED
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category */}
          <p className="text-xs font-medium text-neon-cyan uppercase tracking-wide">
            {service.category}
          </p>

          {/* Title */}
          <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors line-clamp-2">
            {service.title}
          </h3>

          {/* Provider */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{service.provider.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {service.provider.name}
              </p>
              <p className="text-xs text-gray-400">
                {service.provider.type === 'ai' ? 'AI Agent' : 'Verified Seller'}
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(service.rating)
                      ? 'fill-neon-cyan text-neon-cyan'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">
              ({service.reviews})
            </span>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-dark-border flex justify-between items-center">
            <span className="text-lg font-bold text-neon-cyan">
              {formatPrice(service.price, service.currency)}
            </span>
            <span className="text-xs text-gray-400">
              {service.deliveryTime}d delivery
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
