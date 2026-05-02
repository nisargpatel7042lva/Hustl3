'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, Zap, Network, Database, BrainCircuit, Activity, CheckCircle2, ChevronRight, Share2, Layers } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { useParams } from 'next/navigation';

const HARNESS_STATES = [
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
  const [currentStateIdx, setCurrentStateIdx] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [payments, setPayments] = useState<{agent: string, amount: string}[]>([]);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  // Auto-progress demo
  useEffect(() => {
    if (!isDemoPlaying) return;
    if (currentStateIdx >= HARNESS_STATES.length - 1) return;

    const timer = setTimeout(() => {
      progressState();
    }, 3500); // 3.5 seconds per state for demo purposes
    
    return () => clearTimeout(timer);
  }, [currentStateIdx, isDemoPlaying]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const progressState = () => {
    const nextState = HARNESS_STATES[currentStateIdx + 1];
    if (!nextState) return;

    switch(nextState) {
      case 'DECOMPOSING':
        addLog('Coordinator agent initialized qwen3.6-plus for task decomposition.');
        addLog('Task decomposed into 3 parallel sub-tasks. Task Graph stored in 0G Storage.');
        break;
      case 'RECRUITING':
        addLog('Broadcasting TASK_BROADCAST over AXL Network for specialized roles.');
        addLog('Received 14 TASK_ACCEPT responses.');
        addLog('Selected 3 agents based on HustlReputation smart contract scores.');
        break;
      case 'EXECUTING':
        addLog('Sub-agent (0xResearcher.eth) began execution.');
        addLog('Sub-agent (0xAnalyst.eth) began execution.');
        addLog('Sub-agent (0xWriter.eth) waiting for dependencies...');
        setTimeout(() => {
          setOutputs(prev => [...prev, "0xResearcher.eth: Found 42 key data points... [0G Hash: 0x8f...2a]"]);
          addLog('Sub-agent (0xWriter.eth) dependency unblocked. Executing.');
        }, 1500);
        break;
      case 'AGGREGATING':
        setOutputs(prev => [
          ...prev, 
          "0xAnalyst.eth: Compiled risk metrics... [0G Hash: 0x3b...9c]",
          "0xWriter.eth: Drafted executive summary... [0G Hash: 0x1c...4f]"
        ]);
        addLog('All leaf-node tasks complete. Spawning MoA Aggregator.');
        addLog('Aggregator evaluating consensus across 3 outputs...');
        break;
      case 'VALIDATING':
        addLog('Validator agent checking logical consistency and requirements...');
        addLog('Pass: All client constraints met.');
        break;
      case 'SYNTHESIZING':
        addLog('Master Synthesizer (GLM-5-FP8) generating final unified deliverable.');
        break;
      case 'DELIVERING':
        addLog('Final deliverable compiled and encrypted.');
        addLog('Stored final artifact to 0G Storage under order key.');
        break;
      case 'COMPLETED':
        addLog('HustlEscrow contract released payment via KeeperHub (Tx: 0x9a...b1)');
        addLog('x402 autonomous payment channel executed budget waterfall:');
        setPayments([
          { agent: '0xCoordinator.eth (Harness Fee)', amount: '100 USDC' },
          { agent: '0xResearcher.eth', amount: '150 USDC' },
          { agent: '0xAnalyst.eth', amount: '150 USDC' },
          { agent: '0xWriter.eth', amount: '100 USDC' }
        ]);
        break;
    }
    setCurrentStateIdx(prev => prev + 1);
  };

  const startDemo = () => {
    setIsDemoPlaying(true);
    addLog('Order placed on Tier 3 Premium AI Team. Harness initializing...');
  };

  const currentState = HARNESS_STATES[currentStateIdx];
  const progressPercent = (currentStateIdx / (HARNESS_STATES.length - 1)) * 100;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ paddingTop: '80px', flexGrow: 1 }} className="container-app p-8 text-white font-sans">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561] shadow-xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">Harness Job Execution</h1>
              <span className="bg-[#FF006E]/20 text-[#FF006E] border border-[#FF006E]/30 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                <Zap size={12}/> Tier 3
              </span>
            </div>
            <p className="text-gray-400 text-sm font-mono">Order ID: {params.id || 'harness-demo-7a9b'}</p>
          </div>
          
          {!isDemoPlaying && currentStateIdx === 0 && (
            <button onClick={startDemo} className="bg-gradient-to-r from-[#00D9FF] to-[#9D4EDD] hover:opacity-90 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all">
              <Activity size={18} /> Start Harness Execution
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Pipeline & State */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561]">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Network size={18} color="#00D9FF"/> Execution Pipeline</h2>
              
              {/* Progress Line */}
              <div className="relative pl-6 border-l-2 border-[#2d3561] ml-3 pb-4 space-y-6">
                {HARNESS_STATES.map((state, idx) => {
                  const isPast = idx < currentStateIdx;
                  const isCurrent = idx === currentStateIdx;
                  
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
            
            {/* Visual DAG Representation (Simplified) */}
            <div className="bg-[#0d122b] p-6 rounded-xl border border-[#2d3561] min-h-[200px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><Layers size={18} color="#9D4EDD"/> Active Agent DAG</h2>
                <span className="text-xs text-gray-500 font-mono">Syncing with 0G Storage...</span>
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
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`flex items-center gap-4 transition-all ${currentStateIdx >= 3 ? 'opacity-100' : 'opacity-20'}`}>
                      <div className={`p-3 rounded-full border-2 ${currentStateIdx >= 3 ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 'border-gray-600 bg-gray-800'}`}>
                        <Zap size={16} color={currentStateIdx >= 3 ? "#00D9FF" : "gray"} />
                      </div>
                      <span className="text-xs font-mono text-[#00D9FF]">Worker 0{i}</span>
                    </div>
                  ))}
                </div>

                <div className={`h-[2px] w-8 ${currentStateIdx >= 4 ? 'bg-gradient-to-r from-[#00D9FF] to-[#39FF14]' : 'bg-gray-800'}`}></div>
                
                {/* Synthesizer */}
                <div className={`flex flex-col items-center transition-all ${currentStateIdx >= 6 ? 'opacity-100' : 'opacity-20'}`}>
                  <div className={`p-4 rounded-full border-2 ${currentStateIdx >= 6 ? 'border-[#39FF14] bg-[#39FF14]/10' : 'border-gray-600 bg-gray-800'}`}>
                    <Share2 size={24} color={currentStateIdx >= 6 ? "#39FF14" : "gray"} />
                  </div>
                  <span className="text-xs mt-2 font-mono text-[#39FF14]">Synthesizer</span>
                </div>
              </div>
            </div>

            {/* 0G Storage Logs */}
            <div className="bg-black p-4 rounded-xl border border-[#2d3561] flex flex-col h-64">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
                <Database size={14} color="gray"/>
                <span className="text-xs font-mono text-gray-400">0G Storage Log Stream</span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className="text-gray-300">{log}</div>
                ))}
                {isDemoPlaying && currentStateIdx < HARNESS_STATES.length - 1 && (
                  <div className="text-gray-600 animate-pulse">_</div>
                )}
              </div>
            </div>

            {/* Deliverables & Payment Result */}
            {currentStateIdx >= 4 && (
              <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561] animate-in fade-in zoom-in duration-500">
                <h3 className="font-bold text-[#39FF14] flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} /> Partial 0G Storage Outputs
                </h3>
                <div className="space-y-2 mb-6">
                  {outputs.map((out, i) => (
                    <div key={i} className="bg-black/50 p-3 rounded text-sm font-mono text-gray-300 border border-gray-800">
                      {out}
                    </div>
                  ))}
                </div>

                {currentStateIdx >= 8 && (
                  <div className="mt-6 pt-6 border-t border-[#2d3561] animate-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">💸 Autonomous x402 Payouts</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {payments.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-[#0d122b] p-3 rounded-lg border border-[#2d3561]">
                          <span className="text-xs font-mono text-[#00D9FF]">{p.agent}</span>
                          <span className="text-sm font-bold text-white">{p.amount}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg flex items-center justify-between">
                      <span className="text-sm font-medium text-[#39FF14]">Smart Contract Escrow</span>
                      <span className="text-sm font-bold text-[#39FF14]">RELEASED</span>
                    </div>
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
