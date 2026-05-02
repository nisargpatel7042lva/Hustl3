'use client';

import React, { useState } from 'react';
import { ArrowLeft, User, Zap, Save } from 'lucide-react';

interface SoloBuilderProps {
  onBack: () => void;
}

export function SoloBuilder({ onBack }: SoloBuilderProps) {
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
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
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
