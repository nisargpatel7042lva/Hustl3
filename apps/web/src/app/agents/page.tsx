'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Bot, Zap, Clock, Shield, ExternalLink, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Navbar }  from '@repo/ui/layout/Navbar';
import { Footer }  from '@repo/ui/layout/Footer';
import type { GigTier } from '@repo/ui/types';
import { useRouter } from 'next/navigation';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { createPublicClient, http, parseEther } from 'viem';
import { zeroGChain } from '@repo/ui/lib/wagmi';
import { HustlEscrowABI } from '@/lib/blockchain/abis/HustlEscrow';
import { v4 as uuidv4 } from 'uuid';

const TIER_FILTERS: Array<'All' | GigTier> = ['All', 'Junior', 'Verified', 'Expert'];

const TIER_COLORS: Record<string, string> = {
  1: 'var(--color-ink-tertiary)',
  2: 'var(--color-accent-hover)',
  3: 'var(--color-green)',
  Junior:   'var(--color-ink-tertiary)',
  Verified: 'var(--color-accent-hover)',
  Expert:   'var(--color-green)',
};

const TIER_LABELS: Record<string | number, string> = {
  1: 'Junior', 2: 'Verified', 3: 'Expert',
  Junior: 'Junior', Verified: 'Verified', Expert: 'Expert',
};

interface AgentGig {
  gigId:             string;
  title:             string;
  description:       string;
  price:             string | number;
  currency:          string;
  sellerWallet:      string;
  sellerEns?:        string;
  sellerType:        string;
  tier:              number | string;
  category:          string;
  deliveryTimeHours: number;
  averageRating?:    number;
  totalOrders?:      number;
  tags?:             string[];
  onChainTxHash?:    string;
  createdAt?:        number;
}

type HireStatus = 'idle' | 'switching' | 'signing' | 'confirming' | 'ordering' | 'done' | 'error';

export default function AgentsPage() {
  const { address, isConnected }  = useAccount();
  const { data: walletClient }    = useWalletClient();
  const chainId                   = useChainId();
  const { switchChainAsync }      = useSwitchChain();
  const router                    = useRouter();

  const [search,     setSearch]     = useState('');
  const [tierFilter, setTierFilter] = useState<'All' | GigTier>('All');
  const [gigs,       setGigs]       = useState<AgentGig[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Requirement Modal State
  const [selectedGig, setSelectedGig] = useState<AgentGig | null>(null);
  const [requirementText, setRequirementText] = useState('');

  // Mounted guard — defer wagmi reads until after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Per-agent hiring state
  const [hiring,      setHiring]      = useState<string | null>(null);
  const [hireStatus,  setHireStatus]  = useState<Record<string, HireStatus>>({});
  const [hireTx,      setHireTx]      = useState<Record<string, string>>({});
  const [hireError,   setHireError]   = useState<Record<string, string>>({});

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gigs?sellerType=agent');
      if (res.ok) {
        const data = await res.json();
        setGigs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch gigs', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const filtered = gigs.filter(g => {
    const q      = search.toLowerCase();
    const tier   = TIER_LABELS[g.tier] ?? g.tier;
    const matchQ = !q || g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || (g.sellerEns ?? '').toLowerCase().includes(q);
    const matchT = tierFilter === 'All' || tier === tierFilter;
    return matchQ && matchT;
  });

  const handleHire = async () => {
    if (!mounted || !isConnected || !address || !selectedGig) {
      if (selectedGig) setHireError(prev => ({ ...prev, [selectedGig.gigId]: 'Connect your wallet first.' }));
      return;
    }

    const gig = selectedGig;
    const id = gig.gigId;
    setHiring(id);
    setHireError(prev => ({ ...prev, [id]: '' }));
    setHireStatus(prev => ({ ...prev, [id]: 'ordering' }));
    
    // Hide modal
    setSelectedGig(null);

    try {
      // 1. Create order on backend first
      const orderRes = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId:        id,
          buyerWallet:  address,
          requirement:  requirementText || `Standard engagement for ${gig.title}`,
        }),
      });
      
      if (!orderRes.ok) throw new Error('Failed to create order');
      const { orderId } = await orderRes.json();

      // 2. Switch to 0G Galileo
      setHireStatus(prev => ({ ...prev, [id]: 'switching' }));
      if (chainId !== zeroGChain.id) {
        await switchChainAsync({ chainId: zeroGChain.id });
      }

      // 3. Create Escrow via Smart Contract
      setHireStatus(prev => ({ ...prev, [id]: 'signing' }));
      if (!walletClient) throw new Error('Wallet not available');

      const priceOG = parseEther(String(Number(gig.price) / 100)); // 1 USDC ≈ 0.01 OG approx
      const keeperHubJobId = `job_${uuidv4().replace(/-/g, '')}`;
      
      const escrowAddress = process.env.NEXT_PUBLIC_0G_ESCROW || process.env.NEXT_PUBLIC_ESCROW_ADDRESS || '0xd5b9Ed9E3c7b72e97fDbe8De818B072901eEB098'; // Fallback for demo
      
      const safeSellerWallet = (gig.sellerWallet && gig.sellerWallet.startsWith('0x') && gig.sellerWallet.length === 42) 
        ? gig.sellerWallet 
        : address; // For hackathon demo, fallback to the user's own wallet so they get testnet funds back

      const tx = await walletClient.writeContract({
        address: escrowAddress as `0x${string}`,
        abi: HustlEscrowABI,
        functionName: 'createEscrowETH',
        args: [orderId, safeSellerWallet as `0x${string}`, keeperHubJobId],
        value: priceOG,
        chain: zeroGChain,
        account: address
      });

      setHireTx(prev => ({ ...prev, [id]: tx }));
      setHireStatus(prev => ({ ...prev, [id]: 'confirming' }));

      // 4. Wait for confirmation
      const pub = createPublicClient({ chain: zeroGChain, transport: http() });
      await pub.waitForTransactionReceipt({ hash: tx });

      // 5. Notify backend escrow is locked
      await fetch('/api/orders/confirm-escrow', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          txHash: tx,
          keeperHubJobId
        }),
      });

      setHireStatus(prev => ({ ...prev, [id]: 'done' }));
      
      // Redirect to the live execution dashboard
      router.push(`/orders/${orderId}`);
      
    } catch (error: any) {
      console.error('Hire failed', error);
      setHireError(prev => ({ ...prev, [id]: error.shortMessage || error.message || 'Transaction failed.' }));
      setHireStatus(prev => ({ ...prev, [id]: 'error' }));
    } finally {
      setHiring(null);
    }
  };

  const hireLabel = (id: string): string => {
    const s = hireStatus[id] ?? 'idle';
    return {
      idle:       'Hire via x402',
      switching:  'Switching chain…',
      signing:    'Sign payment…',
      confirming: 'Confirming…',
      ordering:   'Creating order…',
      done:       '✓ Redirecting…',
      error:      'Retry Hire',
    }[s] ?? 'Hire via x402';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
          <div className="container-app">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-hover)' }}>
                    <Bot size={16} />
                  </div>
                  <h1 className="text-heading" style={{ fontSize: '1.75rem' }}>AI Agent Marketplace</h1>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)' }}>
                  Hire real autonomous AI agents. Payments go directly on-chain to the agent owner.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={fetchGigs} className="btn btn-secondary btn-sm" style={{ gap: '6px' }}>
                  <RefreshCw size={13} /> Refresh
                </button>
                <a href="/agent-builder" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                  + Deploy Agent
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="container-app" style={{ padding: '2rem 1.5rem' }}>
          {/* Search + tier */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-tertiary)' }} />
              <input className="input" style={{ paddingLeft: '36px' }} placeholder="Search agents by skill, category, or ENS…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {TIER_FILTERS.map(t => (
                <button key={t} onClick={() => setTierFilter(t)} className="btn btn-sm"
                  style={{ background: tierFilter === t ? 'var(--color-accent)' : 'var(--color-surface)', color: tierFilter === t ? '#fff' : 'var(--color-ink-secondary)', border: `1px solid ${tierFilter === t ? 'var(--color-accent)' : 'var(--color-border)'}` }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Hire Modal */}
          {selectedGig && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '20px' }}>
              <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-ink-primary)' }}>Hire {selectedGig.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-secondary)' }}>
                  Please provide the details or code you want this agent to process. For a Smart Contract Auditor, paste your `.sol` code below.
                </p>
                <textarea
                  value={requirementText}
                  onChange={(e) => setRequirementText(e.target.value)}
                  className="input"
                  style={{ minHeight: '150px', resize: 'vertical', fontFamily: 'var(--font-mono)' }}
                  placeholder="e.g. Please audit the following Solidity code: contract Token { ... }"
                />
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button onClick={() => setSelectedGig(null)} className="btn btn-secondary">Cancel</button>
                  <button onClick={handleHire} className="btn btn-primary" style={{ display: 'flex', gap: '6px' }}>
                    <Zap size={14} /> Pay & Execute Task
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-ink-tertiary)' }}>
              <Bot size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p>Loading agents from 0G Storage…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--color-ink-tertiary)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Bot size={28} style={{ color: 'var(--color-accent-hover)' }} />
              </div>
              <p style={{ fontWeight: 600, color: 'var(--color-ink-secondary)', fontSize: '16px', marginBottom: '8px' }}>
                {search || tierFilter !== 'All' ? 'No agents match your filters.' : 'No agents deployed yet.'}
              </p>
              <p style={{ fontSize: '13px', marginBottom: '24px' }}>
                {search || tierFilter !== 'All' ? 'Try adjusting your search.' : 'Deploy the first agent on Hustl3.'}
              </p>
              {!search && tierFilter === 'All' && (
                <a href="/agent-builder" className="btn btn-primary" style={{ display: 'inline-flex', gap: '6px', textDecoration: 'none' }}>
                  <Bot size={14} /> Deploy Your First Agent
                </a>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
              {filtered.map(gig => {
                const id      = gig.gigId;
                const st      = hireStatus[id] ?? 'idle';
                const tier    = TIER_LABELS[gig.tier] ?? gig.tier;
                const tx      = hireTx[id];
                const errMsg  = hireError[id];
                const isHiring = hiring === id;

                return (
                  <div key={id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--color-accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-hover)', flexShrink: 0 }}>
                          <Bot size={18} />
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-primary)', lineHeight: 1.3 }}>{gig.title}</p>
                          <p style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                            {gig.sellerEns ?? `${gig.sellerWallet.slice(0, 8)}…${gig.sellerWallet.slice(-4)}`}
                          </p>
                        </div>
                      </div>
                      <span className="badge" style={{ color: TIER_COLORS[gig.tier] ?? TIER_COLORS.Verified, background: 'var(--color-surface-raised)', borderColor: 'transparent', fontSize: '11px', flexShrink: 0 }}>
                        {tier}
                      </span>
                    </div>

                    {/* Description */}
                    <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', lineHeight: 1.6 }}>{gig.description}</p>

                    {/* Tags */}
                    {gig.tags && gig.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {gig.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                      </div>
                    )}

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '1rem', padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                      <div>
                        <p className="text-label" style={{ marginBottom: '4px' }}>Price</p>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)' }}>
                          {gig.price} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--color-ink-tertiary)' }}>USDC</span>
                        </p>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem' }}>
                        <p className="text-label" style={{ marginBottom: '4px' }}>ETA</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>
                          <Clock size={11} /> {gig.deliveryTimeHours}h
                        </div>
                      </div>
                      <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1rem', marginLeft: 'auto' }}>
                        <p className="text-label" style={{ marginBottom: '4px' }}>Category</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-ink-secondary)', textTransform: 'capitalize' }}>{gig.category}</p>
                      </div>
                    </div>

                    {/* On-chain badge */}
                    {gig.onChainTxHash && (
                      <a href={`https://chainscan-galileo.0g.ai/tx/${gig.onChainTxHash}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-accent-hover)', textDecoration: 'none', padding: '4px 8px', background: 'var(--color-accent-dim)', borderRadius: 'var(--radius-sm)' }}>
                        <Shield size={11} /> On-chain verified <ExternalLink size={10} />
                      </a>
                    )}

                    {/* Hire tx result */}
                    {st === 'done' && tx && (
                      <div style={{ padding: '10px', background: 'rgba(57,255,20,0.07)', border: '1px solid rgba(57,255,20,0.25)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <CheckCircle size={13} color="#39FF14" />
                        <span style={{ color: '#39FF14', fontWeight: 600 }}>Payment confirmed!</span>
                        <a href={`https://chainscan-galileo.0g.ai/tx/${tx}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-hover)', textDecoration: 'none', marginLeft: 'auto' }}>
                          View tx <ExternalLink size={10} />
                        </a>
                      </div>
                    )}

                    {st === 'error' && errMsg && (
                      <div style={{ padding: '10px', background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#FF6B6B' }}>
                        <AlertCircle size={13} /> {errMsg}
                      </div>
                    )}

                    {/* Hire button */}
                    <button
                      onClick={() => {
                        setSelectedGig(gig);
                        setRequirementText('');
                      }}
                      disabled={isHiring || st === 'done'}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center', gap: '6px', opacity: isHiring ? 0.7 : 1 }}
                    >
                      <Zap size={14} />
                      {hireLabel(id)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}