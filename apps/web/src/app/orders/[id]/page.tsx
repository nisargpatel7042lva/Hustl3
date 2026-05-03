'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, AlertTriangle, Zap, Network, Database, BrainCircuit, Activity, CheckCircle2, ChevronRight, Share2, Layers } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { useParams } from 'next/navigation';

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
            <p className="text-gray-400 text-sm font-mono">Order ID: {orderId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Pipeline & State */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561]">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2"><Network size={18} color="#00D9FF"/> Execution Pipeline</h2>
              
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
              <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561] animate-in fade-in zoom-in duration-500">
                <h3 className="font-bold text-[#39FF14] flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} /> Partial 0G Storage Outputs
                </h3>
                <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
                  {outputs.map((out, i) => (
                    <div key={i} className="bg-black/50 p-3 rounded text-sm font-mono text-gray-300 border border-gray-800 whitespace-pre-wrap">
                      {out}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {delivery && (
              <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561] animate-in fade-in zoom-in duration-500">
                <h3 className="font-bold text-[#FF006E] flex items-center gap-2 mb-4">
                  <CheckCircle2 size={18} /> Final Deliverable
                </h3>
                <div className="bg-black/50 p-4 rounded text-sm font-mono text-gray-300 border border-gray-800 whitespace-pre-wrap">
                  {typeof delivery === 'string' ? delivery : JSON.stringify(delivery, null, 2)}
                </div>
              </div>
            )}
            
            {currentState === 'COMPLETED' && (
              <div className="bg-[#1a1f3a] p-6 rounded-xl border border-[#2d3561] animate-in slide-in-from-bottom-4">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">💸 Autonomous x402 Payouts</h3>
                <div className="mt-4 p-3 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-[#39FF14]">Smart Contract Escrow</span>
                  <span className="text-sm font-bold text-[#39FF14]">RELEASED</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
