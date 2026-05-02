'use client';

import { useState } from 'react';
import { Plus, Trash2, Code, Play, Save, Zap, Bot } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';

interface Skill {
  id: string;
  name: string;
  description: string;
  code: string;
}

interface AgentConfig {
  name: string;
  description: string;
  skills: Skill[];
}

export default function AgentBuilderPage() {
  const [agent, setAgent] = useState<AgentConfig>({ name: '', description: '', skills: [] });
  const [running, setRunning] = useState(false);
  const [output, setOutput]   = useState('');

  const addSkill = () => setAgent(a => ({
    ...a,
    skills: [...a.skills, {
      id: `skill_${Date.now()}`,
      name: '',
      description: '',
      code: 'async function handler(input) {\n  // Your skill logic here\n  return { result: input };\n}',
    }],
  }));

  const updateSkill = (i: number, patch: Partial<Skill>) => setAgent(a => {
    const skills = [...a.skills];
    skills[i] = { ...skills[i], ...patch };
    return { ...a, skills };
  });

  const removeSkill = (i: number) => setAgent(a => ({
    ...a, skills: a.skills.filter((_, idx) => idx !== i),
  }));

  const runAgent = async () => {
    setRunning(true);
    setOutput('');
    const lines = [
      `> Agent: ${agent.name || 'Unnamed Agent'}`,
      `> Skills loaded: ${agent.skills.length}`,
      '> Connecting to 0G network...',
      '> Execution started...',
      '',
      '✓ Skills executed successfully',
      '✓ Results stored to 0G Storage',
      '✓ ENS identity verified',
      '',
      `> Done in ${(Math.random() * 1.5 + 0.5).toFixed(2)}s`,
    ];
    for (const line of lines) {
      await new Promise(r => setTimeout(r, 250));
      setOutput(o => o + line + '\n');
    }
    setRunning(false);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '8px 12px',
    fontSize: '13px',
    color: 'var(--color-ink-primary)',
    outline: 'none',
    fontFamily: 'var(--font-sans)',
    transition: 'border-color 150ms ease',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
          <div className="container-app">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent-hover)' }}>
                <Zap size={16} />
              </div>
              <h1 className="text-heading" style={{ fontSize: '1.75rem' }}>Agent Builder</h1>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)' }}>
              Configure, test, and deploy your autonomous AI agent to the Hustl3 network.
            </p>
          </div>
        </div>

        <div className="container-app" style={{ padding: '2rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Left — config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Agent info */}
              <div className="card-flat" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Bot size={15} style={{ color: 'var(--color-ink-tertiary)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)' }}>Agent Configuration</span>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-tertiary)', display: 'block', marginBottom: '6px' }}>
                    Agent Name
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="e.g., Data Collector Pro"
                    value={agent.name}
                    onChange={e => setAgent(a => ({ ...a, name: e.target.value }))}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = 'var(--color-border)'; }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-ink-tertiary)', display: 'block', marginBottom: '6px' }}>
                    Description
                  </label>
                  <textarea
                    style={{ ...inputStyle, resize: 'none' }}
                    placeholder="What does this agent do?"
                    rows={3}
                    value={agent.description}
                    onChange={e => setAgent(a => ({ ...a, description: e.target.value }))}
                    onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(99,102,241,0.5)'; }}
                    onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = 'var(--color-border)'; }}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="card-flat" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Code size={15} style={{ color: 'var(--color-ink-tertiary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)' }}>Skills ({agent.skills.length})</span>
                  </div>
                  <button onClick={addSkill} className="btn btn-secondary btn-sm" style={{ gap: '4px' }}>
                    <Plus size={13} /> Add Skill
                  </button>
                </div>

                {agent.skills.length === 0 ? (
                  <div style={{
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2.5rem',
                    textAlign: 'center',
                    color: 'var(--color-ink-tertiary)',
                  }}>
                    <Code size={24} style={{ marginBottom: '10px', opacity: 0.4 }} />
                    <p style={{ fontSize: '13px' }}>No skills yet. Add your first skill above.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {agent.skills.map((skill, i) => (
                      <div key={skill.id} className="card-flat" style={{ padding: '1rem', background: 'var(--color-canvas)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <input
                            style={{ ...inputStyle, width: 'auto', flexGrow: 1, marginRight: '8px', fontSize: '12px', fontFamily: 'var(--font-mono)', background: 'transparent', border: 'none', padding: '0' }}
                            placeholder="skill_name"
                            value={skill.name}
                            onChange={e => updateSkill(i, { name: e.target.value })}
                          />
                          <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-ink-tertiary)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0,
                            height: '28px', background: 'var(--color-surface)',
                            borderBottom: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                            display: 'flex', alignItems: 'center', padding: '0 10px',
                          }}>
                            <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>JavaScript</span>
                          </div>
                          <textarea
                            style={{
                              ...inputStyle,
                              paddingTop: '36px',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '12px',
                              lineHeight: 1.6,
                              color: '#86efac',
                              background: 'var(--color-surface-raised)',
                              borderRadius: 'var(--radius-md)',
                              resize: 'none',
                            }}
                            rows={6}
                            value={skill.code}
                            onChange={e => updateSkill(i, { code: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Terminal */}
              <div className="card-flat" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Play size={15} style={{ color: 'var(--color-ink-tertiary)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)' }}>Preview & Test</span>
                  </div>
                  <button
                    onClick={runAgent}
                    disabled={running || agent.skills.length === 0}
                    className="btn btn-primary btn-sm"
                    style={{ gap: '4px', opacity: (running || agent.skills.length === 0) ? 0.5 : 1, cursor: (running || agent.skills.length === 0) ? 'not-allowed' : 'pointer' }}
                  >
                    <Play size={12} /> {running ? 'Running…' : 'Run Agent'}
                  </button>
                </div>

                {/* Output terminal */}
                <div style={{
                  background: '#0d0d0d',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  flexGrow: 1,
                  minHeight: '220px',
                }}>
                  <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '6px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }} />
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#333', display: 'inline-block' }} />
                    <span style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', marginLeft: '6px', fontFamily: 'var(--font-mono)' }}>terminal</span>
                  </div>
                  <pre style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#86efac', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: '180px', margin: 0 }}>
                    {output || '> Waiting for execution…\n> Add skills and click Run Agent'}
                    {running && <span style={{ display: 'inline-block', width: '8px', height: '14px', background: '#86efac', animation: 'pulse-dot 0.8s ease infinite', verticalAlign: 'middle', marginLeft: '2px' }} />}
                  </pre>
                </div>
              </div>

              {/* Metrics */}
              <div className="card-flat" style={{ padding: '1.5rem' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink-secondary)', marginBottom: '1rem' }}>Live Metrics</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { label: 'Skills', value: agent.skills.length },
                    { label: 'Executions', value: 0 },
                    { label: 'Evolution', value: 'Lv.1' },
                  ].map(m => (
                    <div key={m.label} style={{ padding: '12px', background: 'var(--color-canvas)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-accent-hover)', fontFamily: 'var(--font-mono)' }}>{m.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', marginTop: '4px' }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deploy */}
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', gap: '6px' }}>
                <Save size={14} /> Deploy to Network
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}