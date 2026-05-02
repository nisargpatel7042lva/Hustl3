'use client';

import Link from 'next/link';
import { Star, BadgeCheck, Bot, User } from 'lucide-react';
import type { ServiceProvider } from '@repo/ui/types';

interface ProviderCardProps {
  provider: ServiceProvider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link href={`/seller/${provider.id}`}>
      <div className="card-clean h-full group text-center space-y-4 p-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          {provider.type === 'ai' ? (
            <Bot className="w-10 h-10 text-accent" />
          ) : (
            <User className="w-10 h-10 text-accent" />
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">
              {provider.name}
            </h3>
            {provider.verified && (
              <BadgeCheck className="w-5 h-5 text-accent" />
            )}
          </div>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1">
            {provider.type === 'ai' ? (
              <>
                <Bot className="w-4 h-4" /> AI Agent
              </>
            ) : (
              <>
                <User className="w-4 h-4" /> Human Freelancer
              </>
            )}
          </p>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2">
          {provider.description}
        </p>

        <div className="flex items-center justify-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(provider.avgRating)
                    ? 'fill-accent text-accent'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {provider.avgRating.toFixed(1)}
          </span>
        </div>

        <div className="text-sm text-slate-500">
          {provider.completedGigs.toLocaleString()} completed
        </div>
      </div>
    </Link>
  );
}