'use client';

import React from 'react';
import { Settings2, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: any | null;
  updateNodeData: (key: string, value: any) => void;
  onDeleteNode: (id: string) => void;
}

export function PropertiesPanel({ selectedNode, updateNodeData, onDeleteNode }: PropertiesPanelProps) {
  return (
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
                <input type="text" value={selectedNode.data.role || ''} onChange={(e) => updateNodeData('role', e.target.value)} className="input" />
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Compute Model</label>
                <select value={selectedNode.data.model || 'qwen3.6-plus'} onChange={(e) => updateNodeData('model', e.target.value)} className="input" style={{ appearance: 'none' }}>
                  <option value="qwen3.6-plus">qwen3.6-plus</option>
                  <option value="GLM-5-FP8">GLM-5-FP8</option>
                </select>
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>System Prompt</label>
                <textarea value={selectedNode.data.prompt || ''} onChange={(e) => updateNodeData('prompt', e.target.value)} rows={4} className="input" style={{ resize: 'none' }} />
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
                <input type="number" min="2" max="8" value={selectedNode.data.workers || 3} onChange={(e) => updateNodeData('workers', parseInt(e.target.value))} className="input" />
              </div>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Aggregation Strategy</label>
                <select value={selectedNode.data.aggregator || 'Synthesize'} onChange={(e) => updateNodeData('aggregator', e.target.value)} className="input" style={{ appearance: 'none' }}>
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
              <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>Condition Expression</label>
              <input type="text" placeholder="e.g. $.riskScore > 7" value={selectedNode.data.condition || ''} onChange={(e) => updateNodeData('condition', e.target.value)} className="input" />
            </div>
          )}

          {/* MEMORY READ NODE PROPS */}
          {selectedNode.type === 'memoryReadNode' && (
            <div>
              <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Storage Key Pattern</label>
              <input type="text" placeholder="e.g. user_context" value={selectedNode.data.key || ''} onChange={(e) => updateNodeData('key', e.target.value)} className="input" />
            </div>
          )}

          {/* MEMORY WRITE NODE PROPS */}
          {selectedNode.type === 'memoryWriteNode' && (
            <>
              <div>
                <label className="text-label" style={{ display: 'block', marginBottom: '6px' }}>0G Storage Key Pattern</label>
                <input type="text" placeholder="e.g. final_report" value={selectedNode.data.key || ''} onChange={(e) => updateNodeData('key', e.target.value)} className="input" />
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
                <input type="text" placeholder="TASK_BROADCAST" value={selectedNode.data.msgType || ''} onChange={(e) => updateNodeData('msgType', e.target.value)} className="input" />
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
              <textarea rows={4} placeholder="Expected JSON schema..." value={selectedNode.data.schema || ''} onChange={(e) => updateNodeData('schema', e.target.value)} className="input" style={{ resize: 'none' }} />
            </div>
          )}

          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <button 
              onClick={() => onDeleteNode(selectedNode.id)}
              className="btn btn-secondary"
              style={{ width: '100%', color: 'var(--color-red)' }}
            >
              <Trash2 size={14} /> Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
