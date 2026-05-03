'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Zap, Save, ExternalLink, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { createPublicClient, http, parseUnits, parseEther } from 'viem';
import { zeroGChain } from '@repo/ui/lib/wagmi';

// Platform fee address — receives $10 USDC equivalent on every agent deploy
const PLATFORM_FEE_ADDRESS = '0xd5b9Ed9E3c7b72e97fDbe8De818B072901eEB098' as `0x${string}`;

// USDC on 0G Galileo testnet (native-OG fallback if USDC not available)
// 10 USDC ≈ 0.1 OG on testnet; we send native OG as the fee
const DEPLOY_FEE_WEI = parseEther('0.1'); // ~$10 at testnet rates

interface SoloBuilderProps {
  onBack: () => void;
}

type DeployStatus = 'idle' | 'switching' | 'signing' | 'confirming' | 'storing' | 'done' | 'error';

export function SoloBuilder({ onBack }: SoloBuilderProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { data: walletClient }   = useWalletClient();
  const chainId                  = useChainId();
  const { switchChainAsync }     = useSwitchChain();

  // Form refs
  const nameRef       = useRef<HTMLInputElement>(null);
  const descRef       = useRef<HTMLInputElement>(null);
  const promptRef     = useRef<HTMLTextAreaElement>(null);
  const modelRef      = useRef<HTMLSelectElement>(null);
  const outputRef     = useRef<HTMLSelectElement>(null);
  const maxTokensRef  = useRef<HTMLInputElement>(null);
  const hirePriceRef  = useRef<HTMLInputElement>(null);
  const categoryRef   = useRef<HTMLSelectElement>(null);

  const [status,  setStatus]  = useState<DeployStatus>('idle');
  const [txHash,  setTxHash]  = useState<string | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const handleDeploy = async () => {
    setError(null);

    if (!isConnected || !address) { setError('Connect your wallet first.'); return; }

    const name      = nameRef.current?.value.trim()       ?? '';
    const desc      = descRef.current?.value.trim()       ?? '';
    const prompt    = promptRef.current?.value.trim()     ?? '';
    const model     = modelRef.current?.value             ?? 'qwen3.6-plus';
    const outputFmt = outputRef.current?.value            ?? 'JSON';
    const maxTok    = parseInt(maxTokensRef.current?.value ?? '4096', 10);
    const hirePrice = parseFloat(hirePriceRef.current?.value ?? '50');
    const category  = categoryRef.current?.value          ?? 'research';

    if (!name) { setError('Agent Name is required.'); return; }
    if (!desc) { setError('Role Description is required.'); return; }
    if (isNaN(hirePrice) || hirePrice <= 0) { setError('Hiring price must be a positive number.'); return; }

    try {
      // 1. Switch to 0G Galileo if needed
      if (chainId !== zeroGChain.id) {
        setStatus('switching');
        await switchChainAsync({ chainId: zeroGChain.id });
      }

      setStatus('signing');
      if (!walletClient) throw new Error('Wallet client unavailable');

      // 2. Send $10 platform fee on-chain → confirmed on 0G
      const tx = await walletClient.sendTransaction({
        to:    PLATFORM_FEE_ADDRESS,
        value: DEPLOY_FEE_WEI,
        data:  '0x' as `0x${string}`,
        chain: zeroGChain,
      });
      setTxHash(tx);
      setStatus('confirming');

      // 3. Wait for on-chain confirmation
      const pub = createPublicClient({ chain: zeroGChain, transport: http() });
      const receipt = await pub.waitForTransactionReceipt({ hash: tx });

      setStatus('storing');

      // 4. Store agent profile in 0G KV (persisted to disk)
      const agentPayload = {
        walletAddress:   address,
        ownerWallet:     address,
        name,
        description:     desc,
        systemPrompt:    prompt,
        computeModel:    model,
        outputFormat:    outputFmt,
        maxTokens:       maxTok,
        priceUsdc:       hirePrice,
        category,
        type:            'ai',
        tier:            hirePrice >= 200 ? 3 : hirePrice >= 75 ? 2 : 1,
        onChainTxHash:   tx,
        blockNumber:     receipt.blockNumber?.toString() ?? null,
        registrationFee: '0.1 OG (~$10)',
        status:          'active',
      };

      const res = await fetch('/api/agents', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(agentPayload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Failed to store agent in 0G Storage');
      }

      // 5. Also create a gig listing so the agent appears in the marketplace
      await fetch('/api/gigs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:             name,
          description:       desc,
          price:             hirePrice.toString(),
          currency:          'USDC',
          sellerType:        'agent',
          sellerWallet:      address,
          category,
          tier:              hirePrice >= 200 ? 3 : hirePrice >= 75 ? 2 : 1,
          deliveryTimeHours: model === 'qwen3.6-plus' ? 1 : 2,
          tags:              [model, outputFmt.toLowerCase(), category],
          onChainTxHash:     tx,
        }),
      });

      setStatus('done');

      // 6. Redirect to agents page after 2s
      setTimeout(() => router.push('/agents'), 2000);
    } catch (err: any) {
      console.error('Deploy failed:', err);
      setError(err?.shortMessage ?? err?.message ?? 'Transaction rejected or failed');
      setStatus('error');
    }
  };

  const isDeploying = ['switching', 'signing', 'confirming', 'storing'].includes(status);

  const statusLabel: Record<DeployStatus, string> = {
    idle:       'Deploy Agent — Pay 0.1 OG ($10)',
    switching:  'Switching to 0G Chain…',
    signing:    'Confirm in wallet (0.1 OG fee)…',
    confirming: 'Waiting for block confirmation…',
    storing:    'Writing to 0G Storage…',
    done:       '✓ Agent Live — Redirecting…',
    error:      'Deploy Agent — Pay 0.1 OG ($10)',
  };

  return (
    <div className="container-app section" style={{ maxWidth: '800px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={14} /> Back to Selection
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color="var(--color-accent-hover)" />
        </div>
        <div>
          <h1 className="text-heading" style={{ fontSize: '1.5rem' }}>Deploy Solo Specialist</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)' }}>
            Your agent will be live on-chain. Deployment fee: <strong style={{ color: 'var(--color-ink-primary)' }}>0.1 OG (~$10)</strong>
          </p>
        </div>
      </div>

      {/* Wallet guard */}
      {!isConnected && (
        <div style={{ padding: '12px 16px', marginBottom: '1.5rem', background: 'rgba(255,160,0,0.08)', border: '1px solid rgba(255,160,0,0.3)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#FFA000' }}>
          ⚠️ Connect your wallet to deploy an agent on-chain.
        </div>
      )}

      {/* Success */}
      {status === 'done' && txHash && (
        <div style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'rgba(57,255,20,0.07)', border: '1px solid rgba(57,255,20,0.3)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <CheckCircle size={18} color="#39FF14" />
            <span style={{ fontWeight: 700, color: '#39FF14', fontSize: '15px' }}>Agent deployed on 0G Galileo!</span>
          </div>
          <p style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-tertiary)', marginBottom: '10px', wordBreak: 'break-all' }}>
            Tx: {txHash}
          </p>
          <a href={`https://chainscan-galileo.0g.ai/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-accent-hover)', textDecoration: 'none' }}>
            View on 0G Explorer <ExternalLink size={11} />
          </a>
          <span style={{ marginLeft: '16px', fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>Redirecting to marketplace…</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && error && (
        <div style={{ padding: '12px 16px', marginBottom: '1.5rem', background: 'rgba(255,0,0,0.07)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#FF6B6B', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
        </div>
      )}

      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Row 1: Name + Model */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Agent Name *</label>
            <input ref={nameRef} type="text" className="input" placeholder="e.g. Solidity Auditor" />
          </div>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>0G Compute Model</label>
            <select ref={modelRef} className="input">
              <option value="qwen3.6-plus">Qwen 3.6 Plus (Fast)</option>
              <option value="GLM-5-FP8">GLM-5-FP8 (Balanced)</option>
              <option value="llama3-70b">Llama 3 70B (Power)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Description */}
        <div>
          <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Role Description *</label>
          <input ref={descRef} type="text" className="input" placeholder="What does this agent do? Be specific." />
        </div>

        {/* Row 3: Category + Hire Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Category</label>
            <select ref={categoryRef} className="input">
              <option value="research">Research</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="finance">Finance / DeFi</option>
              <option value="security">Security / Audit</option>
              <option value="data">Data Analysis</option>
            </select>
          </div>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>
              <DollarSign size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Hiring Price (USDC per task) *
            </label>
            <input ref={hirePriceRef} type="number" min="1" step="1" className="input" defaultValue={50} placeholder="50" />
          </div>
        </div>

        {/* System Prompt */}
        <div>
          <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>System Prompt</label>
          <textarea ref={promptRef} className="input" rows={5}
            placeholder="You are an expert smart contract auditor. Analyze the provided code for vulnerabilities and return a structured JSON report."
            style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '13px' }} />
        </div>

        {/* Row: Output + Max Tokens */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Output Format</label>
            <select ref={outputRef} className="input">
              <option value="JSON">JSON</option>
              <option value="Markdown Report">Markdown Report</option>
              <option value="Source Code">Source Code</option>
              <option value="Plain Text">Plain Text</option>
            </select>
          </div>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Max Tokens</label>
            <input ref={maxTokensRef} type="number" className="input" defaultValue={4096} />
          </div>
        </div>

        {/* Fee notice */}
        <div style={{ padding: '12px 16px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-ink-tertiary)' }}>
              📋 <strong style={{ color: 'var(--color-ink-secondary)' }}>Deployment fee:</strong> 0.1 OG (~$10) on 0G Galileo Testnet
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-ink-tertiary)' }}>
              → 0xd5b9…eEB098
            </span>
          </div>
          <p style={{ marginTop: '6px', color: 'var(--color-ink-tertiary)' }}>
            Agent profile stored in 0G KV. Gig listing created automatically in the marketplace.
          </p>
        </div>

        <button
          onClick={handleDeploy}
          disabled={isDeploying || status === 'done' || !isConnected}
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', gap: '8px', fontSize: '14px', padding: '14px', opacity: (isDeploying || !isConnected) ? 0.7 : 1 }}
        >
          {isDeploying ? <Zap size={16} style={{ animation: 'pulse 1s infinite' }} />
           : status === 'done' ? <CheckCircle size={16} />
           : <Save size={16} />}
          {statusLabel[status]}
        </button>
      </div>
    </div>
  );
}
