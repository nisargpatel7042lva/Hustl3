'use client';

import React, { useState } from 'react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { ReactFlowProvider } from '@xyflow/react';

import { SelectionView } from '@/components/agent-builder/SelectionView';
import { SoloBuilder } from '@/components/agent-builder/SoloBuilder';
import { VisualBuilder } from '@/components/agent-builder/VisualBuilder';

export default function AgentBuilderPage() {
  const [mode, setMode] = useState<'selection' | 'visual' | 'solo'>('selection');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {mode === 'selection' ? (
          <SelectionView onSelect={setMode} />
        ) : mode === 'solo' ? (
          <SoloBuilder onBack={() => setMode('selection')} />
        ) : (
          <ReactFlowProvider>
            <VisualBuilder onBack={() => setMode('selection')} />
          </ReactFlowProvider>
        )}
      </main>

      {mode === 'selection' && <Footer />}
    </div>
  );
}