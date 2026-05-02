'use client';

import { useState } from 'react';
import { Bot, Activity, TrendingUp, Zap } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';

const AGENTS = [
  { id: '1', name: 'DataCollector', status: 'running' as const,   tasks: 12, earnings: 250, evolution: 3 },
  { id: '2', name: 'ContentWriter', status: 'idle' as const,      tasks: 8,  earnings: 180, evolution: 2 },
  { id: '3', name: 'ImageGen',      status: 'running' as const,   tasks: 24, earnings: 520, evolution: 4 },
  { id: '4', name: 'CodeAssistant', status: 'idle' as const,      tasks: 15, earnings: 340, evolution: 3 },
];

const TASKS = [
  { id: 't1', agentId: '1', description: 'Collect trending topics from Twitter API', status: 'running' as const, progress: 65 },
  { id: 't2', agentId: '3', description: 'Generate product images for batch 42',    status: 'running' as const, progress: 30 },
  { id: 't3', agentId: '2', description: 'Write blog posts for Q4 campaign',        status: 'queued' as const,  progress: 0  },
];

const STATUS_COLOR: Record<string, string> = { running: 'var(--color-green)', idle: 'var(--color-amber)', queued: 'var(--color-amber)', completed: 'var(--color-ink-tertiary)' };
const STATUS_BG: Record<string, string>    = { running: 'rgba(34,197,94,0.1)', idle: 'rgba(245,158,11,0.1)', queued: 'rgba(245,158,11,0.1)', completed: 'var(--color-surface-raised)' };

export default function SwarmPage() {
  const [tab, setTab] = useState<'agents' | 'tasks' | 'analytics'>('agents');

  const totalEarnings = AGENTS.reduce((s, a) => s + a.earnings, 0);
  const activeCount   = AGENTS.filter(a => a.status === 'running').length;
  const avgEvo        = Math.round(AGENTS.reduce((s, a) => s + a.evolution, 0) / AGENTS.length);

  const SUMMARY = [
    { icon: <Bot size={15} />,        label: 'Total Agents',  value: AGENTS.length },
    { icon: <Activity size={15} />,   label: 'Active Now',    value: activeCount },
    { icon: <TrendingUp size={15} />, label: 'Earnings',      value: `$${totalEarnings}` },
    { icon: <Zap size={15} />,        label: 'Avg Evolution', value: `Lv.${avgEvo}` },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-canvas)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ paddingTop: '80px', flexGrow: 1 }}>
        {/* Header */}
        <div style={{ borderBottom: '1px solid var(--color-border)', padding: '2rem 0' }}>
          <div className="container-app">
            <h1 className="text-heading" style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Swarm Dashboard</h1>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-tertiary)' }}>
              Monitor your autonomous AI agent fleet in real time.
            </p>
          </div>
        </div>

        <div className="container-app" style={{ padding: '2rem 1.5rem' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '2rem' }}>
            {SUMMARY.map(s => (
              <div key={s.label} className="card-flat" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-ink-tertiary)' }}>
                  {s.icon}
                  <span className="text-label">{s.label}</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: 'fit-content', marginBottom: '1.5rem' }}>
            {(['agents', 'tasks', 'analytics'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="btn btn-sm"
                style={{
                  background: tab === t ? 'var(--color-surface-raised)' : 'transparent',
                  color: tab === t ? 'var(--color-ink-primary)' : 'var(--color-ink-tertiary)',
                  border: `1px solid ${tab === t ? 'var(--color-border-hover)' : 'transparent'}`,
                }}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab: Agents */}
          {tab === 'agents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
              {AGENTS.map(agent => (
                <div key={agent.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-ink-tertiary)' }}>
                        <Bot size={14} />
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)' }}>{agent.name}</span>
                    </div>
                    <span
                      style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: STATUS_COLOR[agent.status],
                        boxShadow: `0 0 0 2px ${STATUS_BG[agent.status]}`,
                        display: 'inline-block',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {[
                      { label: 'Tasks Completed', value: agent.tasks },
                      { label: 'Earnings',         value: `$${agent.earnings}` },
                      { label: 'Evolution Level',  value: `Lv.${agent.evolution}` },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--color-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                        <span style={{ fontSize: '12px', color: 'var(--color-ink-tertiary)' }}>{row.label}</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Tasks */}
          {tab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {TASKS.map(task => (
                <div key={task.id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink-primary)', marginBottom: '4px' }}>{task.description}</p>
                      <p style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', fontFamily: 'var(--font-mono)' }}>Agent #{task.agentId}</p>
                    </div>
                    <span
                      className="badge"
                      style={{
                        background: STATUS_BG[task.status],
                        color: STATUS_COLOR[task.status],
                        borderColor: 'transparent',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-surface-raised)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${task.progress}%`, background: 'var(--color-accent)', borderRadius: '99px', transition: 'width 1s ease' }} />
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', marginTop: '6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{task.progress}%</p>
                </div>
              ))}
            </div>
          )}

          {/* Tab: Analytics */}
          {tab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {[
                { label: 'Tasks Today',     value: '47',  delta: '+12% from yesterday' },
                { label: 'Avg Duration',    value: '2.4m', delta: '-8% from last week' },
                { label: 'Success Rate',    value: '94%', delta: '+2% from last week' },
                { label: 'Revenue (7d)',    value: '$1,290', delta: '+31% from last week' },
              ].map(m => (
                <div key={m.label} className="card-flat" style={{ padding: '1.5rem' }}>
                  <p className="text-label" style={{ marginBottom: '8px' }}>{m.label}</p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-ink-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.03em', marginBottom: '6px' }}>{m.value}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-green)' }}>{m.delta}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}