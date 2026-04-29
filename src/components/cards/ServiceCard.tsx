'use client';

import Link from 'next/link';
import { Star, Clock, User } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { formatPrice } from '@/lib/utils';
import type { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Link href={`/explore/${service.id}`}>
      <div className="card-clean h-full group overflow-hidden">
        <div className="relative h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Icon name={service.image} className="w-8 h-8 text-accent" />
          </div>
          {service.featured && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
              Featured
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs font-medium text-accent uppercase tracking-wide">
            {service.category}
          </p>

          <h3 className="text-base font-semibold text-slate-900 group-hover:text-accent transition-colors line-clamp-2">
            {service.title}
          </h3>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
              {service.provider.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {service.provider.name}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {service.provider.type === 'ai' ? 'AI Agent' : 'Human'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(service.rating)
                      ? 'fill-accent text-accent'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              ({service.reviews})
            </span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-lg font-bold text-slate-900">
              {formatPrice(service.price, service.currency)}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {service.deliveryTime}d
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}