'use client';

import React from 'react';
import { 
  ArrowLeft, Cpu, BrainCircuit, Layers, GitBranch, 
  Download, Upload, Radio, SplitSquareHorizontal, Combine, Share2, Zap, Save 
} from 'lucide-react';

interface ToolbarPanelProps {
  onBack: () => void;
  onAddNode: (type: string) => void;
  onDeploy: () => void;
  deploying: boolean;
}

export function ToolbarPanel({ onBack, onAddNode, onDeploy, deploying }: ToolbarPanelProps) {
  const ToolbarItem = ({ type, title, subtitle, icon: Icon, color }: any) => (
    <button onClick={() => onAddNode(type)} className="card" style={{ padding: '0.75rem', display: 'flex', gap: '12px', textAlign: 'left', borderLeft: `3px solid ${color}`, marginBottom: '8px' }}>
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{title}</div>
        <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>{subtitle}</div>
      </div>
    </button>
  );

  return (
    <div style={{ width: '280px', borderRight: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', padding: '1rem', zIndex: 10, overflowY: 'auto' }}>
      
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '1rem' }}>
        <ArrowLeft size={14} /> Back
      </button>

      <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Cpu size={14} /> Node Types
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ToolbarItem type="agentNode" title="Solo Agent" subtitle="Single intelligence node" icon={BrainCircuit} color="var(--color-accent)" />
        <ToolbarItem type="moaNode" title="MoA Cluster" subtitle="Parallel mixture of agents" icon={Layers} color="#FF006E" />
        <ToolbarItem type="conditionNode" title="Condition" subtitle="Branching logic" icon={GitBranch} color="#F5A623" />
        <ToolbarItem type="memoryReadNode" title="Memory Read" subtitle="Read from 0G KV" icon={Download} color="#4A90E2" />
        <ToolbarItem type="memoryWriteNode" title="Memory Write" subtitle="Write to 0G Log/KV" icon={Upload} color="#4A90E2" />
        <ToolbarItem type="axlNode" title="AXL Broadcast" subtitle="Send AXL message" icon={Radio} color="#F8E71C" />
        <ToolbarItem type="forkNode" title="Parallel Fork" subtitle="Split into parallel paths" icon={SplitSquareHorizontal} color="#50E3C2" />
        <ToolbarItem type="joinNode" title="Parallel Join" subtitle="Wait for branches" icon={Combine} color="#50E3C2" />
        <ToolbarItem type="outputNode" title="Output" subtitle="Final deliverable" icon={Share2} color="var(--color-green)" />
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <button 
          onClick={onDeploy} 
          disabled={deploying}
          className="btn btn-primary"
          style={{ width: '100%' }}
        >
          {deploying ? <Zap size={14} className="animate-pulse" /> : <Save size={14} />}
          {deploying ? 'Deploying to 0G...' : 'Deploy Blueprint'}
        </button>
      </div>
    </div>
  );
}
