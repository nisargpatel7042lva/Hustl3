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
  Connection,
  Edge,
  Node,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { ToolbarPanel } from './ToolbarPanel';
import { PropertiesPanel } from './PropertiesPanel';

const initialNodes: Node[] = [
  { id: 'start', type: 'inputNode', position: { x: 50, y: 250 }, data: { description: 'Receives gig requirements' } },
];
const initialEdges: Edge[] = [];

interface VisualBuilderProps {
  onBack: () => void;
}

export function VisualBuilder({ onBack }: VisualBuilderProps) {
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

  const handleAddNode = (type: string) => {
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

  const handleDeleteNode = (id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setSelectedNode(null);
  };

  const deployBlueprint = async () => {
    setDeploying(true);
    await new Promise(r => setTimeout(r, 1500));
    setDeploying(false);
    alert('✅ Blueprint successfully deployed to 0G Storage!\nThis Harness is now live as a Premium AI Team.');
    onBack();
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', background: 'var(--color-canvas)', overflow: 'hidden' }}>
      <ToolbarPanel 
        onBack={onBack} 
        onAddNode={handleAddNode} 
        onDeploy={deployBlueprint} 
        deploying={deploying} 
      />

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

      <PropertiesPanel 
        selectedNode={selectedNode} 
        updateNodeData={updateNodeData} 
        onDeleteNode={handleDeleteNode} 
      />
    </div>
  );
}
