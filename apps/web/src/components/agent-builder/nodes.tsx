'use client';

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Database, BrainCircuit, Layers, GitBranch, 
  Download, Upload, Radio, SplitSquareHorizontal, Combine, Share2 
} from 'lucide-react';

export const NodeWrapper = ({ children, color, title, icon: Icon, subtitle, handles }: any) => (
  <div className="card-flat" style={{ padding: '1rem', minWidth: '220px', borderTop: `3px solid ${color}` }}>
    {handles.target && <Handle type="target" position={Position.Left} style={{ background: color, width: '10px', height: '10px', left: '-5px' }} />}
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <Icon size={16} color={color} />
      <strong style={{ color: 'var(--color-ink-primary)', fontSize: '13px' }}>{title}</strong>
    </div>
    <div style={{ fontSize: '11px', color: 'var(--color-ink-secondary)' }}>{subtitle}</div>
    {children}
    {handles.source && <Handle type="source" position={Position.Right} style={{ background: color, width: '10px', height: '10px', right: '-5px' }} />}
  </div>
);

export const InputNode = ({ data }: any) => (
  <NodeWrapper color="#00D9FF" title="Task Input" subtitle={data.description || 'Task Context & Schema'} icon={Database} handles={{source: true}}>
  </NodeWrapper>
);

export const AgentNode = ({ data }: any) => (
  <NodeWrapper color="var(--color-accent)" title={data.role || 'Solo Specialist'} subtitle={`Model: ${data.model || 'qwen3.6-plus'}`} icon={BrainCircuit} handles={{target: true, source: true}}>
    <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.prompt || 'Default prompt...'}</div>
  </NodeWrapper>
);

export const MoANode = ({ data }: any) => (
  <NodeWrapper color="#FF006E" title="MoA Cluster" subtitle={`Workers: ${data.workers || 3} Parallel`} icon={Layers} handles={{target: true, source: true}}>
    <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginTop: '4px' }}>Aggregator: {data.aggregator || 'Synthesize'}</div>
  </NodeWrapper>
);

export const ConditionNode = ({ data }: any) => (
  <NodeWrapper color="#F5A623" title="Condition" subtitle={data.condition || 'If condition is true'} icon={GitBranch} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const MemoryReadNode = ({ data }: any) => (
  <NodeWrapper color="#4A90E2" title="Memory Read" subtitle={`Key: ${data.key || 'user_context'}`} icon={Download} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const MemoryWriteNode = ({ data }: any) => (
  <NodeWrapper color="#4A90E2" title="Memory Write" subtitle={`Key: ${data.key || 'result'}`} icon={Upload} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const AXLNode = ({ data }: any) => (
  <NodeWrapper color="#F8E71C" title="AXL Broadcast" subtitle={`Type: ${data.msgType || 'TASK_BROADCAST'}`} icon={Radio} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const ForkNode = ({ data }: any) => (
  <NodeWrapper color="#50E3C2" title="Parallel Fork" subtitle="Split execution" icon={SplitSquareHorizontal} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const JoinNode = ({ data }: any) => (
  <NodeWrapper color="#50E3C2" title="Parallel Join" subtitle="Wait for all branches" icon={Combine} handles={{target: true, source: true}}>
  </NodeWrapper>
);

export const OutputNode = ({ data }: any) => (
  <NodeWrapper color="var(--color-green)" title="Output" subtitle="Final deliverable node" icon={Share2} handles={{target: true}}>
  </NodeWrapper>
);

export const nodeTypes = {
  inputNode: InputNode,
  agentNode: AgentNode,
  moaNode: MoANode,
  conditionNode: ConditionNode,
  memoryReadNode: MemoryReadNode,
  memoryWriteNode: MemoryWriteNode,
  axlNode: AXLNode,
  forkNode: ForkNode,
  joinNode: JoinNode,
  outputNode: OutputNode,
};
