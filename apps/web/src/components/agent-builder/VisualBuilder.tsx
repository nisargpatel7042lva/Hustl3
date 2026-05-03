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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { useAccount, useWalletClient, useChainId, useSwitchChain } from 'wagmi';
import { createPublicClient, http, parseEther, encodeFunctionData } from 'viem';
import { zeroGChain } from '@repo/ui/lib/wagmi';
import { nodeTypes } from './nodes';
import { ToolbarPanel } from './ToolbarPanel';
import { PropertiesPanel } from './PropertiesPanel';

const PLATFORM_FEE_ADDRESS = '0xd5b9Ed9E3c7b72e97fDbe8De818B072901eEB098' as `0x${string}`;
const REGISTRATION_FEE = parseEther('0.001');

const initialNodes: Node[] = [
  { id: 'start', type: 'inputNode', position: { x: 50, y: 250 }, data: { description: 'Receives gig requirements' } },
];
const initialEdges: Edge[] = [];

type DeployStatus = 'idle' | 'switching' | 'signing' | 'confirming' | 'storing' | 'done' | 'error';

interface VisualBuilderProps {
  onBack: () => void;
}

export function VisualBuilder({ onBack }: VisualBuilderProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        workers: type === 'moaNode' ? 3 : undefined,
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
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setSelectedNode(null);
  };

  const deployBlueprint = async () => {
    setError(null);

    if (!isConnected || !address) {
      setError('Connect your wallet first.');
      return;
    }
    if (nodes.length < 2) {
      setError('Add at least one agent node to your blueprint before deploying.');
      return;
    }

    try {
      // 1. Switch chain if needed
      if (chainId !== zeroGChain.id) {
        setStatus('switching');
        await switchChainAsync({ chainId: zeroGChain.id });
      }

      // 2. Serialize blueprint and store in 0G KV
      setStatus('signing');
      const blueprint = { nodes, edges, createdBy: address, createdAt: Date.now() };
      const blueprintRes = await fetch('/api/agents/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blueprint, ownerWallet: address }),
      });

      let blueprintId = `blueprint-${Date.now()}`;
      if (blueprintRes.ok) {
        const bpData = await blueprintRes.json();
        blueprintId = bpData.blueprintId ?? blueprintId;
      }

      // 3. Send on-chain registration fee
      if (!walletClient) throw new Error('Wallet client not available');

      const txHashValue = await walletClient.sendTransaction({
        to:    PLATFORM_FEE_ADDRESS,
        value: REGISTRATION_FEE,
        data:  '0x' as `0x${string}`,
        chain: zeroGChain,
      });

      setTxHash(txHashValue);
      setStatus('confirming');

      const publicClient = createPublicClient({ chain: zeroGChain, transport: http() });
      await publicClient.waitForTransactionReceipt({ hash: txHashValue });

      // 4. Store blueprint metadata with tx hash
      setStatus('storing');
      await fetch('/api/agents/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint,
          ownerWallet:     address,
          blueprintId,
          onChainTxHash:   txHashValue,
          registrationFee: '0.001 OG',
          status:          'active',
        }),
      });

      setStatus('done');
    } catch (err: any) {
      console.error('Blueprint deploy failed:', err);
      setError(err?.message ?? 'Transaction failed');
      setStatus('error');
    }
  };

  const isDeploying = ['switching', 'signing', 'confirming', 'storing'].includes(status);

  const statusLabel: Record<DeployStatus, string> = {
    idle:       'Deploy Blueprint',
    switching:  'Switching to 0G Chain…',
    signing:    'Sign transaction…',
    confirming: 'Confirming on-chain…',
    storing:    'Storing to 0G…',
    done:       'Deployed ✓',
    error:      'Deploy Blueprint',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)', background: 'var(--color-canvas)' }}>

      {/* Top status bar */}
      {(status === 'done' || status === 'error') && (
        <div style={{
          padding: '10px 20px',
          background: status === 'done' ? 'rgba(57,255,20,0.07)' : 'rgba(255,0,0,0.07)',
          borderBottom: `1px solid ${status === 'done' ? 'rgba(57,255,20,0.25)' : 'rgba(255,0,0,0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
        }}>
          {status === 'done' ? (
            <>
              <CheckCircle size={15} color="#39FF14" />
              <span style={{ color: '#39FF14', fontWeight: 600 }}>Blueprint deployed on 0G Chain!</span>
              {txHash && (
                <a
                  href={`https://chainscan-galileo.0g.ai/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent-hover)', textDecoration: 'none', marginLeft: '8px' }}
                >
                  View tx <ExternalLink size={11} />
                </a>
              )}
            </>
          ) : (
            <>
              <AlertCircle size={15} color="#FF6B6B" />
              <span style={{ color: '#FF6B6B' }}>{error}</span>
            </>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ToolbarPanel
          onBack={onBack}
          onAddNode={handleAddNode}
          onDeploy={deployBlueprint}
          deploying={isDeploying}
          deployLabel={statusLabel[status]}
          isConnected={isConnected}
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
            <MiniMap nodeStrokeColor="var(--color-border)" nodeColor="var(--color-surface-raised)" maskColor="rgba(10,10,10,0.8)" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }} />
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
    </div>
  );
}
