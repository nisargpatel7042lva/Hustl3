'use client';

import { FormEvent, useState } from 'react';
import { getEnsAddress, getEnsName } from '@wagmi/core';
import { mainnet } from 'wagmi/chains';
import { useWallet } from '@/lib/hooks/useWallet';
import { config } from '@/lib/wagmi';

interface EnsLookupPanelProps {
  compact?: boolean;
}

interface LookupState {
  ensName: string | null;
  address: string | null;
  error: string | null;
}

function isWalletAddress(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function isEnsName(value: string): value is `${string}.eth` {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.eth$/i.test(value);
}

export function EnsLookupPanel({ compact = false }: EnsLookupPanelProps) {
  const { isConnected, ensName, address, displayName } = useWallet();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LookupState>({
    ensName: null,
    address: null,
    error: null,
  });

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = query.trim();
    if (!value) {
      setResult({ ensName: null, address: null, error: 'Enter an ENS name or wallet address.' });
      return;
    }

    setIsLoading(true);
    setResult({ ensName: null, address: null, error: null });

    try {
      if (isEnsName(value)) {
        const resolved = await getEnsAddress(config, {
          name: value.toLowerCase() as `${string}.eth`,
          chainId: mainnet.id,
        });

        if (!resolved) {
          setResult({ ensName: value.toLowerCase(), address: null, error: 'ENS name found but no address is set.' });
        } else {
          setResult({ ensName: value.toLowerCase(), address: resolved, error: null });
        }
      } else if (isWalletAddress(value)) {
        const reverse = await getEnsName(config, {
          address: value,
          chainId: mainnet.id,
        });

        setResult({
          ensName: reverse ?? null,
          address: value,
          error: reverse ? null : 'No ENS name is mapped to this address.',
        });
      } else {
        setResult({ ensName: null, address: null, error: 'Input must be a .eth name or 0x wallet address.' });
      }
    } catch {
      setResult({ ensName: null, address: null, error: 'ENS lookup failed. Check network and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`glass-card border-white/10 ${compact ? 'p-3' : 'p-4'} space-y-3`}>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-text-muted">Connected Identity</p>
        {isConnected ? (
          <p className="text-sm text-white">
            {ensName ? ensName : displayName}
            {address ? <span className="text-text-muted"> ({address.slice(0, 6)}...{address.slice(-4)})</span> : null}
          </p>
        ) : (
          <p className="text-sm text-text-muted">Connect wallet to show ENS identity</p>
        )}
      </div>

      <form onSubmit={handleLookup} className="space-y-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Lookup: planner.agentforge.eth or 0x..."
          className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/60 text-white placeholder:text-text-muted/60"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-secondary !px-4 !py-2.5 !rounded-xl !text-xs disabled:opacity-60"
        >
          {isLoading ? 'Resolving ENS...' : 'Resolve ENS'}
        </button>
      </form>

      {(result.error || result.ensName || result.address) && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs space-y-1">
          {result.ensName && <p className="text-white">ENS: {result.ensName}</p>}
          {result.address && <p className="text-white">Address: {result.address}</p>}
          {result.error && <p className="text-red-300">{result.error}</p>}
        </div>
      )}
    </div>
  );
}