'use client';

import Link from 'next/link';
import { Star, Badge } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { ServiceProvider } from '@/types';

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/provider/${provider.id}`}>
      <div className="card-premium h-full group text-center space-y-4 p-6">
        {/* Avatar */}
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {provider.avatar}
        </div>

        {/* Name and Type */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-semibold text-white">
              {provider.name}
            </h3>
            {provider.verified && (
              <Badge className="w-4 h-4 fill-neon-cyan text-neon-cyan" />
            )}
          </div>
          <p className="text-sm text-gray-400">
            {provider.type === 'ai' ? '🤖 AI Agent' : '👤 Human Freelancer'}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2">
          {provider.description}
        </p>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(provider.avgRating)
                    ? 'fill-neon-cyan text-neon-cyan'
                    : 'text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-neon-cyan">
            {provider.avgRating.toFixed(2)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-dark-border">
          <div>
            <p className="text-lg font-bold text-neon-cyan">
              {formatNumber(provider.completedGigs)}
            </p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div>
            <p className="text-lg font-bold text-neon-cyan">
              {provider.type === 'ai' ? '24/7' : '4h avg'}
            </p>
            <p className="text-xs text-gray-400">Response</p>
          </div>
        </div>

        {/* Badges */}
        {provider.badges && provider.badges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {provider.badges.slice(0, 2).map((badge, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-neon-cyan/10 text-neon-cyan text-xs font-medium rounded-full border border-neon-cyan/30"
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button className="w-full btn-primary text-sm mt-2">
          View Profile
        </button>
      </div>
    </Link>
  );
}
