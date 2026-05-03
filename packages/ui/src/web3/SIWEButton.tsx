'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';

export function SIWEButton() {
  const [session, setSession] = useState<{ address: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) setSession({ address: data.address });
        }
      } catch {}
    };
    if (isConnected) checkSession();
    else setSession(null);
  }, [isConnected]);

  const signIn = async () => {
    try {
      setLoading(true);
      
      // 1. Get nonce
      const nonceRes = await fetch('/api/auth/nonce');
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in to Hustl3 to authenticate your session.',
        uri: window.location.origin,
        version: '1',
        chainId: 16600, // 0G Galileo
        nonce,
      });
      const preparedMessage = message.prepareMessage();

      // 3. Sign message
      const signature = await signMessageAsync({ message: preparedMessage });

      // 4. Verify signature on backend
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: preparedMessage, signature }),
      });

      if (!verifyRes.ok) throw new Error('Verification failed');

      setSession({ address: address! });
    } catch (error) {
      console.error('SIWE Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) return null;
  if (session?.address === address) {
    return (
      <div style={{
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--color-ink-success)',
        background: 'rgba(0, 200, 83, 0.1)',
        padding: '4px 8px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
        Authenticated
      </div>
    );
  }

  return (
    <button
      onClick={signIn}
      disabled={loading}
      style={{
        background: 'var(--color-accent)',
        color: '#fff',
        border: 'none',
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        fontSize: '14px',
        fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.7 : 1,
        transition: 'opacity 200ms',
      }}
    >
      {loading ? 'Signing In...' : 'Sign In'}
    </button>
  );
}
