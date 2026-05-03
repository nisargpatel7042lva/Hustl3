/**
 * React hook for resolving and displaying ENS names
 * Handles caching and fallback to address display
 */

import { useEffect, useState } from 'react';

interface UseEnsNameResult {
  ensName: string | null;
  displayName: string;
  shortAddress: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to resolve ENS name for a wallet address
 * Returns ENS name or address, with loading/error states
 */
export function useEnsName(address: string | null | undefined): UseEnsNameResult {
  const [ensName, setEnsName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setEnsName(null);
      setError(null);
      return;
    }

    const normalized = address.toLowerCase();
    setIsLoading(true);
    setError(null);

    // Fetch ENS name from API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(`/api/ens/reverse?address=${normalized}`, {
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.ensName) {
          setEnsName(data.ensName);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error('Failed to resolve ENS name:', err);
        setError(err instanceof Error ? err.message : 'Failed to resolve ENS');
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [address]);

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  const displayName = ensName || shortAddress;

  return {
    ensName,
    displayName,
    shortAddress,
    isLoading,
    error,
  };
}

/**
 * Hook to resolve multiple ENS names in bulk
 * More efficient than individual lookups
 */
export function useEnsNamesBulk(addresses: (string | null | undefined)[]): Record<string, string | null> {
  const [results, setResults] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (addresses.length === 0) {
      setResults({});
      return;
    }

    const validAddresses = addresses
      .filter((addr) => addr && /^0x[a-fA-F0-9]{40}$/.test(addr))
      .map((addr) => addr!.toLowerCase());

    if (validAddresses.length === 0) {
      setResults({});
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch('/api/ens/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: validAddresses }),
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.results) {
          const mapping: Record<string, string | null> = {};
          data.results.forEach((item: { address: string; ensName: string | null }) => {
            mapping[item.address] = item.ensName;
          });
          setResults(mapping);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error('Failed to bulk resolve ENS names:', err);
        setIsLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [addresses.join(',')]);

  return results;
}
