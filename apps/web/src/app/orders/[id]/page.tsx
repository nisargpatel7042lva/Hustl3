'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, Zap, Network, Database, BrainCircuit, Activity, CheckCircle2, ChevronRight, Share2, Layers } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { useParams } from 'next/navigation';
import { useAccount, useWalletClient } from 'wagmi';
import { HustlEscrowABI } from '@/lib/blockchain/abis/HustlEscrow';
import { zeroGChain } from '@repo/ui/lib/wagmi';

const HARNESS_STATES = [
  'NOT_STARTED',
  'INITIALIZING',
  'DECOMPOSING',
  'RECRUITING',
  'EXECUTING',
  'AGGREGATING',
  'VALIDATING',
  'SYNTHESIZING',
  'DELIVERING',
  'COMPLETED'
];

export default function OrderFlowPage() {
  const params = useParams();
  const orderId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [currentState, setCurrentState] = useState('NOT_STARTED');
  const [logs, setLogs] = useState<string[]>([]);
  const [taskGraph, setTaskGraph] = useState<any[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [delivery, setDelivery] = useState<any>(null);
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!orderId) return;
    
    // Poll for harness state
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/harness`);
        if (res.ok) {
          const data = await res.json();
          setCurrentState(data.state);
          setTaskGraph(data.graph || []);
          setDelivery(data.delivery);
          
          if (data.graph && data.graph.length > 0) {
             const newOutputs = data.graph.filter((g: any) => g.output).map((g: any) => `${g.assignedAgent}: ${g.output}`);
             setOutputs(newOutputs);
          }
        }
      } catch (err) {
        console.error('Failed to poll harness state', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  const currentStateIdx = HARNESS_STATES.indexOf(currentState) === -1 ? 0 : HARNESS_STATES.indexOf(currentState);

  const handleRelease = async () => {
    if (!walletClient || !orderId) return;
    try {
      setReleasing(true);
      const escrowAddress = process.env.NEXT_PUBLIC_0G_ESCROW || process.env.NEXT_PUBLIC_ESCROW_ADDRESS;
      await walletClient.writeContract({
        address: escrowAddress as `0x${string}`,
        abi: HustlEscrowABI,
        functionName: 'releaseEscrow',
        args: [orderId],
        chain: zeroGChain,
        account: address
      });
      setReleased(true);
    } catch (err) {
      console.error('Release failed', err);
    } finally {
      setReleasing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ paddingTop: '80px', flexGrow: 1 }} className="container-app p-8 text-white font-sans">
        
        {/* System Activity Banner */}
        <div className="mb-8 p-4 rounded-xl border" style={{ background: 'var(--color-accent-dim)', borderColor: 'var(--color-accent)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <AlertTriangle color="var(--color-accent)" size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>System Activity: What is happening right now?</h3>
            <p style={{ color: 'var(--color-ink-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
              The x402 payment you just signed has securely locked funds in the <strong>HustlEscrow Smart Contract</strong> on the 0G Network. 
              The backend has detected the transaction and triggered the <strong>MoA (Mixture-of-Agents) Execution Harness</strong>. 
              The system is now hitting the 0G Compute endpoint (or fallback) to decompose your prompt into a Directed Acyclic Graph (DAG), recruit sub-agents, execute them in parallel, and synthesize the final deliverable.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8 p-6 rounded-xl border shadow-xl" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-heading" style={{ fontSize: '1.75rem' }}>Harness Job Execution</h1>
              <span className="badge" style={{ background: 'rgba(255, 0, 110, 0.1)', color: '#FF006E', borderColor: 'rgba(255, 0, 110, 0.2)' }}>
                <Zap size={12}/> Tier 3 Intelligence
              </span>
            </div>
            <p style={{ color: 'var(--color-ink-tertiary)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Order ID: {orderId}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)', marginBottom: '4px' }}>Status</p>
            <p style={{ fontWeight: 700, color: currentState === 'COMPLETED' ? 'var(--color-green)' : 'var(--color-accent)' }}>
              {currentState.replace('_', ' ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Pipeline & State */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="p-6 rounded-xl border" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--color-ink-primary)' }}>
                <Network size={18} style={{ color: 'var(--color-accent)' }}/> Execution Pipeline
              </h2>
              
              {/* Progress Line */}
              <div className="relative pl-6 border-l-2 border-[#2d3561] ml-3 pb-4 space-y-6">
                {HARNESS_STATES.filter(s => s !== 'NOT_STARTED').map((state, idx) => {
                  const mappedIdx = idx + 1; // Since we filtered NOT_STARTED
                  const isPast = mappedIdx < currentStateIdx;
                  const isCurrent = mappedIdx === currentStateIdx;
                  
                  return (
                    <div key={state} className="relative">
                      <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 ${
                        isPast ? 'bg-[#39FF14] border-[#39FF14]' : 
                        isCurrent ? 'bg-[#00D9FF] border-[#00D9FF] animate-pulse' : 
                        'bg-[#1a1f3a] border-[#2d3561]'
                      }`}></div>
                      <div className={`text-sm font-bold tracking-wider ${
                        isPast ? 'text-gray-300' : 
                        isCurrent ? 'text-[#00D9FF]' : 
                        'text-gray-600'
                      }`}>
                        {state}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Logs, DAG, Output */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Visual DAG Representation */}
            <div className="p-6 rounded-xl border min-h-[200px]" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-ink-primary)' }}>
                  <Layers size={18} color="#9D4EDD"/> Active Agent DAG
                </h2>
                <span className="text-xs font-mono" style={{ color: 'var(--color-ink-tertiary)' }}>Syncing with 0G Storage & Compute...</span>
              </div>
              
              <div className="flex items-center justify-center gap-4 py-8">
                {/* Coordinator */}
                <div className={`flex flex-col items-center transition-all ${currentStateIdx >= 1 ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`p-4 rounded-full border-2 ${currentStateIdx >= 1 ? 'border-[#FF006E] bg-[#FF006E]/10' : 'border-gray-600 bg-gray-800'}`}>
                    <BrainCircuit size={24} color={currentStateIdx >= 1 ? "#FF006E" : "gray"} />
                  </div>
                  <span className="text-xs mt-2 font-mono text-[#FF006E]">Coordinator</span>
                </div>
                
                <div className={`h-[2px] w-8 ${currentStateIdx >= 2 ? 'bg-gradient-to-r from-[#FF006E] to-[#00D9FF]' : 'bg-gray-800'}`}></div>
                
                {/* Workers */}
                <div className="flex flex-col gap-4">
                  {taskGraph.length > 0 ? taskGraph.map((node, i) => (
                    <div key={i} className={`flex items-center gap-4 transition-all ${currentStateIdx >= 3 ? 'opacity-100' : 'opacity-20'}`}>
                      <div className={`p-3 rounded-full border-2 ${node.status === 'COMPLETED' ? 'border-[#39FF14] bg-[#39FF14]/10' : currentStateIdx >= 3 ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-gray-600 bg-gray-800'}`}>
                        <Zap size={16} color={node.status === 'COMPLETED' ? "#39FF14" : currentStateIdx >= 3 ? "#00D9FF" : "gray"} />
                      </div>
                      <span className="text-xs font-mono text-[#00D9FF]">{node.assignedAgent ? `${node.assignedAgent.slice(0, 8)}...` : `Worker ${i+1}`}</span>
                    </div>
                  )) : (
                     <div className="flex items-center gap-4 opacity-50">
                        <span className="text-xs font-mono text-gray-500">Waiting for sub-tasks...</span>
                     </div>
                  )}
                </div>

                <div className={`h-[2px] w-8 ${currentStateIdx >= 4 ? 'bg-gradient-to-r from-[#00D9FF] to-[#39FF14]' : 'bg-gray-800'}`}></div>
                
                {/* Synthesizer */}
                <div className={`flex flex-col items-center transition-all ${currentStateIdx >= 7 ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`p-4 rounded-full border-2 ${currentStateIdx >= 7 ? 'border-[#39FF14] bg-[#39FF14]/10' : 'border-gray-600 bg-gray-800'}`}>
                    <Share2 size={24} color={currentStateIdx >= 7 ? "#39FF14" : "gray"} />
                  </div>
                  <span className="text-xs mt-2 font-mono text-[#39FF14]">Synthesizer</span>
                </div>
              </div>
            </div>

            {/* Deliverables & Payment Result */}
            {outputs.length > 0 && (
              <div className="p-6 rounded-xl border animate-in fade-in zoom-in duration-500" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--color-green)' }}>
                  <CheckCircle2 size={18} /> Partial 0G Storage Outputs
                </h3>
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {outputs.map((out, i) => (
                    <div key={i} className="p-3 rounded text-sm font-mono border whitespace-pre-wrap" style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border)', color: 'var(--color-ink-secondary)' }}>
                      {out}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {delivery && (
              <div className="p-6 rounded-xl border animate-in fade-in zoom-in duration-500" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold flex items-center gap-2 mb-4" style={{ color: '#FF006E' }}>
                  <CheckCircle2 size={18} /> Final Synthesized Deliverable
                </h3>
                <div className="p-4 rounded text-sm font-mono border whitespace-pre-wrap" style={{ background: 'var(--color-canvas)', borderColor: 'var(--color-border)', color: 'var(--color-ink-primary)' }}>
                  {typeof delivery === 'string' ? delivery : JSON.stringify(delivery, null, 2)}
                </div>
              </div>
            )}
            
            {currentState === 'COMPLETED' && (
              <div className="p-6 rounded-xl border animate-in slide-in-from-bottom-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-ink-primary)' }}>💸 Autonomous x402 Payouts</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-ink-tertiary)', marginBottom: '16px' }}>
                  The deliverables have been securely pushed to 0G Storage. You may now inspect them and release the funds held in the <strong>KeeperHub Escrow</strong> directly to the agent's wallet.
                </p>
                {!released ? (
                  <button 
                    onClick={handleRelease}
                    disabled={releasing}
                    className="w-full mt-2 p-3 rounded-lg flex items-center justify-center font-bold transition-all cursor-pointer"
                    style={{ background: 'rgba(255, 0, 110, 0.1)', color: '#FF006E', border: '1px solid rgba(255, 0, 110, 0.3)' }}
                  >
                    {releasing ? 'Releasing Funds on-chain...' : 'Approve Deliverable & Release Escrow'}
                  </button>
                ) : (
                  <div className="mt-2 p-3 rounded-lg flex items-center justify-between" style={{ background: 'rgba(0, 200, 83, 0.1)', border: '1px solid rgba(0, 200, 83, 0.3)' }}>
                    <span className="text-sm font-medium" style={{ color: 'var(--color-green)' }}>Smart Contract Escrow</span>
                    <span className="text-sm font-bold flex items-center gap-1" style={{ color: 'var(--color-green)' }}>
                      <CheckCircle2 size={14} /> RELEASED
                    </span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
