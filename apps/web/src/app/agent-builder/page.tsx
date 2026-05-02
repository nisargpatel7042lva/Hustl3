'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge,
  Node,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { 
  Zap, Save, Play, Database, BrainCircuit, Share2, Layers, Cpu, 
  Settings2, Trash2, Sparkles, User, ArrowLeft, Network, GitBranch, 
  Download, Upload, Radio, SplitSquareHorizontal, Combine 
} from 'lucide-react';

// --- Custom Nodes ---

const NodeWrapper = ({ children, color, title, icon: Icon, subtitle, handles }: any) => (
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

const InputNode = ({ data }: any) => (
  <NodeWrapper color="#00D9FF" title="Task Input" subtitle={data.description || 'Task Context & Schema'} icon={Database} handles={{source: true}}>
  </NodeWrapper>
);

const AgentNode = ({ data }: any) => (
  <NodeWrapper color="var(--color-accent)" title={data.role || 'Solo Specialist'} subtitle={`Model: ${data.model || 'qwen3.6-plus'}`} icon={BrainCircuit} handles={{target: true, source: true}}>
    <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.prompt || 'Default prompt...'}</div>
  </NodeWrapper>
);

const MoANode = ({ data }: any) => (
  <NodeWrapper color="#FF006E" title="MoA Cluster" subtitle={`Workers: ${data.workers || 3} Parallel`} icon={Layers} handles={{target: true, source: true}}>
    <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', marginTop: '4px' }}>Aggregator: {data.aggregator || 'Synthesize'}</div>
  </NodeWrapper>
);

const ConditionNode = ({ data }: any) => (
  <NodeWrapper color="#F5A623" title="Condition" subtitle={data.condition || 'If condition is true'} icon={GitBranch} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const MemoryReadNode = ({ data }: any) => (
  <NodeWrapper color="#4A90E2" title="Memory Read" subtitle={`Key: ${data.key || 'user_context'}`} icon={Download} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const MemoryWriteNode = ({ data }: any) => (
  <NodeWrapper color="#4A90E2" title="Memory Write" subtitle={`Key: ${data.key || 'result'}`} icon={Upload} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const AXLNode = ({ data }: any) => (
  <NodeWrapper color="#F8E71C" title="AXL Broadcast" subtitle={`Type: ${data.msgType || 'TASK_BROADCAST'}`} icon={Radio} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const ForkNode = ({ data }: any) => (
  <NodeWrapper color="#50E3C2" title="Parallel Fork" subtitle="Split execution" icon={SplitSquareHorizontal} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const JoinNode = ({ data }: any) => (
  <NodeWrapper color="#50E3C2" title="Parallel Join" subtitle="Wait for all branches" icon={Combine} handles={{target: true, source: true}}>
  </NodeWrapper>
);

const OutputNode = ({ data }: any) => (
  <NodeWrapper color="var(--color-green)" title="Output" subtitle="Final deliverable node" icon={Share2} handles={{target: true}}>
  </NodeWrapper>
);

const nodeTypes = {
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

const initialNodes: Node[] = [
  { id: 'start', type: 'inputNode', position: { x: 50, y: 250 }, data: { description: 'Receives gig requirements' } },
];
const initialEdges: Edge[] = [];

// --- Visual Builder Component ---

function AgentBuilderCanvas({ onBack }: { onBack: () => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [deploying, setDeploying] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'var(--color-ink-secondary)', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => setSelectedNode(node);
  const onPaneClick = () => setSelectedNode(null);

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 250 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: { 
        role: type === 'agentNode' ? 'New Specialist' : undefined,
        workers: type === 'moaNode' ? 3 : undefined
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) node.data = { ...node.data, [key]: value };
        return node;
      })
    );
    setSelectedNode((prev: any) => ({ ...prev, data: { ...prev.data, [key]: value } }));
  };

  const deployBlueprint = async () => {
    setDeploying(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeploying(false);
    alert('✅ Blueprint successfully deployed to 0G Storage!\nThis Harness is now live as a Premium AI Team.');
    onBack();
  };

  const ToolbarItem = ({ type, title, subtitle, icon: Icon, color }: any) => (
    <button onClick={() => addNode(type)} className="card" style={{ padding: '0.75rem', display: 'flex', gap: '12px', textAlign: 'left', borderLeft: `3px solid ${color}`, marginBottom: '8px' }}>
      <Icon size={16} color={color} style={{ flexShrink: 0, mt: '2px' }} />
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{title}</div>
        <div style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>{subtitle}</div>
      </div>
    </button>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: 'var(--color-canvas)', overflow: 'hidden' }}>
      
      {/* LEFT TOOLBAR */}
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
            onClick={deployBlueprint} 
            disabled={deploying}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            {deploying ? <Zap size={14} className="animate-pulse" /> : <Save size={14} />}
            {deploying ? 'Deploying to 0G...' : 'Deploy Blueprint'}
          </button>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: 'var(--color-canvas)' }}
        >
          <Background color="var(--color-border)" gap={16} size={1} />
          <Controls style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', fill: 'var(--color-ink-primary)' }} />
          <MiniMap nodeStrokeColor="var(--color-border)" nodeColor="var(--color-surface-raised)" maskColor="rgba(10, 10, 10, 0.8)" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
        </ReactFlow>

        <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'none', zIndex: 10 }}>
          <div className="card-flat" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            <span className="badge" style={{ background: 'rgba(255,0,110,0.1)', color: '#FF006E', borderColor: 'rgba(255,0,110,0.2)' }}>Tier 3</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>Visual Agent Builder</span>
          </div>
        </div>
      </div>

      {/* RIGHT PROPERTIES PANEL */}
      <div style={{ width: '320px', borderLeft: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', flexDirection: 'column', padding: '1.5rem', zIndex: 10, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <Settings2 size={16} color="var(--color-ink-secondary)" />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink-primary)' }}>Properties</h3>
        </div>

        {!selectedNode ? (
          <div style={{ textAlign: 'center', color: 'var(--color-ink-tertiary)', marginTop: '2rem', fontSize: '13px' }}>
            Select a node on the canvas to configure its properties.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* AGENT NODE PROPS */}
            {selectedNode.type === 'agentNode' && (
              <>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Role Name</label>
                  <input type="text" value={selectedNode.data.role as string || ''} onChange={(e) => updateNodeData('role', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Compute Model</label>
                  <select value={selectedNode.data.model as string || 'qwen3.6-plus'} onChange={(e) => updateNodeData('model', e.target.value)} className="input" style={{ appearance: 'none' }}>
                    <option value="qwen3.6-plus">qwen3.6-plus</option>
                    <option value="GLM-5-FP8">GLM-5-FP8</option>
                  </select>
                </div>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>System Prompt</label>
                  <textarea value={selectedNode.data.prompt as string || ''} onChange={(e) => updateNodeData('prompt', e.target.value)} rows={4} className="input" style={{ resize: 'none' }} />
                </div>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Output Format</label>
                  <select className="input" style={{ appearance: 'none' }}>
                    <option>JSON</option>
                    <option>Markdown</option>
                    <option>Code</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input type="checkbox" defaultChecked /> <span style={{ fontSize: '13px', color: 'var(--color-ink-secondary)' }}>Enable AXL Communication</span>
                </div>
              </>
            )}

            {/* MOA NODE PROPS */}
            {selectedNode.type === 'moaNode' && (
              <>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Parallel Workers</label>
                  <input type="number" min="2" max="8" value={selectedNode.data.workers as number || 3} onChange={(e) => updateNodeData('workers', parseInt(e.target.value))} className="input" />
                </div>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Aggregation Strategy</label>
                  <select value={selectedNode.data.aggregator as string || 'Synthesize'} onChange={(e) => updateNodeData('aggregator', e.target.value)} className="input" style={{ appearance: 'none' }}>
                    <option value="Synthesize">Synthesize (Merge)</option>
                    <option value="Vote">Majority Vote</option>
                    <option value="Best-of">Best-of Selection</option>
                  </select>
                </div>
              </>
            )}

            {/* CONDITION NODE PROPS */}
            {selectedNode.type === 'conditionNode' && (
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Condition Expression (JSON Path)</label>
                <input type="text" placeholder="e.g. $.riskScore > 7" value={selectedNode.data.condition as string || ''} onChange={(e) => updateNodeData('condition', e.target.value)} className="input" />
              </div>
            )}

            {/* MEMORY READ NODE PROPS */}
            {selectedNode.type === 'memoryReadNode' && (
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Storage Key Pattern</label>
                <input type="text" placeholder="e.g. user_context" value={selectedNode.data.key as string || ''} onChange={(e) => updateNodeData('key', e.target.value)} className="input" />
              </div>
            )}

            {/* MEMORY WRITE NODE PROPS */}
            {selectedNode.type === 'memoryWriteNode' && (
              <>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Storage Key Pattern</label>
                  <input type="text" placeholder="e.g. final_report" value={selectedNode.data.key as string || ''} onChange={(e) => updateNodeData('key', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Write Mode</label>
                  <select className="input" style={{ appearance: 'none' }}>
                    <option>Overwrite KV</option>
                    <option>Append Log</option>
                  </select>
                </div>
              </>
            )}

            {/* AXL NODE PROPS */}
            {selectedNode.type === 'axlNode' && (
              <>
                <div>
                  <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Message Type</label>
                  <input type="text" placeholder="TASK_BROADCAST" value={selectedNode.data.msgType as string || ''} onChange={(e) => updateNodeData('msgType', e.target.value)} className="input" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input type="checkbox" defaultChecked /> <span style={{ fontSize: '13px', color: 'var(--color-ink-secondary)' }}>Wait for responses</span>
                </div>
              </>
            )}

            {/* INPUT NODE PROPS */}
            {selectedNode.type === 'inputNode' && (
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Input Schema Definition</label>
                <textarea rows={4} placeholder="Expected JSON schema..." value={selectedNode.data.schema as string || ''} onChange={(e) => updateNodeData('schema', e.target.value)} className="input" style={{ resize: 'none' }} />
              </div>
            )}

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
              <button 
                onClick={() => {
                  setNodes(nds => nds.filter(n => n.id !== selectedNode.id));
                  setSelectedNode(null);
                }}
                className="btn btn-secondary"
                style={{ width: '100%', color: 'var(--color-red)' }}
              >
                <Trash2 size={14} /> Delete Node
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


// --- Solo Agent Builder Component ---

function SoloAgentBuilder({ onBack }: { onBack: () => void }) {
  const [deploying, setDeploying] = useState(false);

  const handleDeploy = async () => {
    setDeploying(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeploying(false);
    alert('✅ Solo Agent successfully deployed to 0G Storage & Registry!');
    onBack();
  };

  return (
    <div className="container-app section" style={{ maxWidth: '800px' }}>
      <button onClick={onBack} className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={14} /> Back to Selection
      </button>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color="var(--color-ink-primary)" />
        </div>
        <div>
          <h1 className="text-heading" style={{ fontSize: '1.5rem' }}>Create Solo Specialist</h1>
          <p className="text-subheading" style={{ fontSize: '14px' }}>Configure a single, specialized AI agent.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Agent Name</label>
            <input type="text" className="input" placeholder="e.g. Solidity Auditor" />
          </div>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>0G Compute Model</label>
            <select className="input" style={{ appearance: 'none' }}>
              <option value="qwen3.6-plus">Qwen 3.6 Plus</option>
              <option value="GLM-5-FP8">GLM-5-FP8</option>
              <option value="llama3-70b">Llama 3 70B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Agent Role Description</label>
          <input type="text" className="input" placeholder="What does this agent do?" />
        </div>

        <div>
          <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>System Prompt Template</label>
          <textarea className="input" rows={6} placeholder="You are an expert... Context: {{context}}" style={{ resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '13px' }}></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Output Format</label>
            <select className="input" style={{ appearance: 'none' }}>
              <option>JSON</option>
              <option>Markdown Report</option>
              <option>Source Code</option>
            </select>
          </div>
          <div>
            <label className="text-label" style={{ display: 'block', marginBottom: '8px' }}>Max Tokens</label>
            <input type="number" className="input" defaultValue={4096} />
          </div>
        </div>

        <div className="card-flat" style={{ padding: '1rem', marginTop: '1rem' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Advanced Settings</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-ink-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Enable 0G Storage Memory (Read/Write)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--color-ink-secondary)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked /> Enable AXL P2P Communication
            </label>
          </div>
        </div>

        <button 
          onClick={handleDeploy} 
          disabled={deploying}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {deploying ? <Zap size={16} className="animate-pulse" /> : <Save size={16} />}
          {deploying ? 'Deploying to 0G...' : 'Deploy Solo Agent'}
        </button>
      </div>
    </div>
  );
}

// --- Mode Selection & Main Page ---

export default function AgentBuilderPage() {
  const [mode, setMode] = useState<'selection' | 'visual' | 'solo'>('selection');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {mode === 'selection' ? (
          <div className="container-app section" style={{ maxWidth: '900px' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <span className="badge badge-accent mb-4">Agent Creation Studio</span>
              <h1 className="text-heading" style={{ marginBottom: '1rem' }}>How do you want to build?</h1>
              <p className="text-subheading" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Create a specialized solo agent or construct a powerful multi-agent organization that collaborates autonomously.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* Option 1: Solo Agent */}
              <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-ink-primary)' }}>
                  <User size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: '0.5rem' }}>Tier 1: Solo Specialist</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
                  Create a single, focused AI agent. Define its system prompt, skill manifest, and 0G Compute model to perform specific, bounded tasks.
                </p>
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%' }}
                  onClick={() => setMode('solo')}
                >
                  Create Solo Agent
                </button>
              </div>

              {/* Option 2: Harness / MoA (Visual Builder) */}
              <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', border: '1px solid var(--color-accent)', boxShadow: '0 0 40px rgba(99,102,241,0.1)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-accent-hover)' }}>
                  <Network size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-ink-primary)', marginBottom: '0.5rem' }}>Tier 3: Premium AI Team</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-secondary)', marginBottom: '2rem', flexGrow: 1 }}>
                  Design a hierarchical multi-agent organization. Use the Visual Graph Builder to connect MoA clusters, specialists, and synthesizers.
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => setMode('visual')}
                >
                  <Sparkles size={16} /> Open Visual Builder
                </button>
              </div>

            </div>
          </div>
        ) : mode === 'solo' ? (
          <SoloAgentBuilder onBack={() => setMode('selection')} />
        ) : (
          <ReactFlowProvider>
            <AgentBuilderCanvas onBack={() => setMode('selection')} />
          </ReactFlowProvider>
        )}
      </main>

      {mode === 'selection' && <Footer />}
    </div>
  );
}