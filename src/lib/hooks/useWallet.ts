'use client';

import { useAccount, useDisconnect, useEnsName, useBalance } from 'wagmi';

export function useWallet() {
  const { address, isConnected, isConnecting, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null);

  return {
    address,
    isConnected,
    isConnecting,
    connector,
    ensName,
    displayName,
    balance,
    disconnect,
  };
}