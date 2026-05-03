'use client';

import Link from 'next/link';
import { Star, BadgeCheck, Bot, User, Zap, Layers, Network } from 'lucide-react';
import { useEnsName } from '@repo/ui/lib/hooks/useEnsName';

interface ProviderCardProps {
  provider: any; // Type relaxed for demo
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const isAI = provider.type === 'ai';
  const { displayName } = useEnsName(provider.walletAddress);
  
  // Mocking tier assignment based on ID or random
  const tier = provider.tier || (isAI ? (Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1) : 1);
  
  // Use ENS name if available, otherwise use provider name
  const providerName = provider.ensName || displayName || provider.name;

  return (
    <Link href={`/seller/${provider.id || provider.name}`}>
      <div className="card hover:border-[var(--color-accent-hover)] transition-all duration-300 h-full group text-center space-y-4 p-6 relative overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        
        {/* Tier 3 Background Glow Effect */}
        {tier === 3 && (
          <div style={{ position: 'absolute', top: '-30px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,0,110,0.25) 0%, transparent 70%)', zIndex: 0 }} />
        )}

        <div className="relative z-10 w-20 h-20 rounded-full mx-auto flex items-center justify-center border-2" style={{
          background: isAI ? 'var(--color-canvas)' : 'var(--color-surface-raised)',
          borderColor: tier === 3 ? '#FF006E' : tier === 2 ? '#9D4EDD' : 'var(--color-border)',
          boxShadow: tier === 3 ? '0 0 15px rgba(255,0,110,0.4)' : tier === 2 ? '0 0 10px rgba(157,78,221,0.3)' : 'none'
        }}>
          {isAI ? (
            <Bot className="w-10 h-10" style={{ color: tier === 3 ? '#FF006E' : tier === 2 ? '#9D4EDD' : 'var(--color-accent-hover)' }} />
          ) : (
            <User className="w-10 h-10 text-gray-400" />
          )}
        </div>

        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-wide truncate">
              {providerName}
            </h3>
            {provider.verified && (
              <BadgeCheck className="w-5 h-5 text-[#00D9FF]" />
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2">
            {tier === 3 ? (
              <span className="bg-[#FF006E]/10 border border-[#FF006E]/30 text-[#FF006E] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Network size={12} /> Premium AI Team
              </span>
            ) : tier === 2 ? (
              <span className="bg-[#9D4EDD]/10 border border-[#9D4EDD]/30 text-[#9D4EDD] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Layers size={12} /> MoA Coordinator
              </span>
            ) : (
              <span className="bg-gray-800 border border-gray-700 text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                {isAI ? <Bot size={12}/> : <User size={12}/>} Solo {isAI ? 'Agent' : 'Freelancer'}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 relative z-10 px-2 h-10">
          {provider.description || "Decentralized intelligence provider on Hustl3."}
        </p>

        <div className="flex items-center justify-center gap-1 relative z-10">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(provider.avgRating || 5)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-700'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-white ml-1">
            {(provider.avgRating || 5).toFixed(1)}
          </span>
        </div>

        <div className="text-xs font-mono text-gray-500 relative z-10 pt-2 border-t border-gray-800">
          {(provider.completedGigs || 0).toLocaleString()} Harness Jobs Completed
        </div>
      </div>
    </Link>
  );
}