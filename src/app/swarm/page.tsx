'use client';

import { useState } from 'react';
import { Bot, Activity, TrendingUp, Users, Zap, Eye } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface SwarmAgent {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed';
  tasks: number;
  earnings: number;
  evolution: number;
}

interface SwarmTask {
  id: string;
  agentId: string;
  description: string;
  status: 'queued' | 'running' | 'completed';
  progress: number;
}

const mockAgents: SwarmAgent[] = [
  { id: '1', name: 'DataCollector', status: 'running', tasks: 12, earnings: 250, evolution: 3 },
  { id: '2', name: 'ContentWriter', status: 'idle', tasks: 8, earnings: 180, evolution: 2 },
  { id: '3', name: 'ImageGen', status: 'running', tasks: 24, earnings: 520, evolution: 4 },
  { id: '4', name: 'CodeAssistant', status: 'idle', tasks: 15, earnings: 340, evolution: 3 },
];

const mockTasks: SwarmTask[] = [
  { id: 't1', agentId: '1', description: 'Collect trending topics from Twitter', status: 'running', progress: 65 },
  { id: 't2', agentId: '3', description: 'Generate product images for batch 42', status: 'running', progress: 30 },
  { id: 't3', agentId: '2', description: 'Write blog posts for Q4 campaign', status: 'queued', progress: 0 },
];

export default function SwarmDashboardPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'tasks' | 'analytics'>('agents');

  const totalEarnings = mockAgents.reduce((sum, a) => sum + a.earnings, 0);
  const activeAgents = mockAgents.filter((a) => a.status === 'running').length;

  return (
    <div className="min-h-screen bg-bg-dark text-text-main selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-16 relative overflow-hidden">
        <div className="ambient-glow bg-accent top-0 left-1/4 w-[600px] h-[600px]"></div>

        <div className="max-width-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="heading-xl mb-2">Swarm Dashboard</h1>
            <p className="text-lg text-text-muted">Monitor and manage your autonomous AI agent swarm</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="glass-card p-6 border-t-2 border-t-accent/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent" />
                </div>
                <span className="text-sm font-medium text-text-muted">Total Agents</span>
              </div>
              <div className="text-3xl font-bold text-white">{mockAgents.length}</div>
            </div>
            <div className="glass-card p-6 border-t-2 border-t-green-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-sm font-medium text-text-muted">Active Now</span>
              </div>
              <div className="text-3xl font-bold text-white">{activeAgents}</div>
            </div>
            <div className="glass-card p-6 border-t-2 border-t-accent-blue/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-blue" />
                </div>
                <span className="text-sm font-medium text-text-muted">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold text-white">${totalEarnings}</div>
            </div>
            <div className="glass-card p-6 border-t-2 border-t-accent-teal/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-accent-teal" />
                </div>
                <span className="text-sm font-medium text-text-muted">Avg Evolution</span>
              </div>
              <div className="text-3xl font-bold text-white">
                Lv.{Math.round(mockAgents.reduce((sum, a) => sum + a.evolution, 0) / mockAgents.length)}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 mb-8 p-1 bg-white/5 rounded-2xl border border-white/10 w-fit"
          >
            {(['agents', 'tasks', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-white/10 text-white shadow-glow'
                    : 'text-text-muted hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === 'agents' && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {mockAgents.map((agent, i) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`glass-card p-6 cursor-pointer transition-colors ${
                      selectedAgent === agent.id ? 'border-accent shadow-glow' : ''
                    }`}
                    onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-white tracking-tight">{agent.name}</span>
                      </div>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          agent.status === 'running'
                            ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                            : agent.status === 'idle'
                            ? 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                            : 'bg-text-muted'
                        }`}
                      />
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                        <span className="text-text-muted">Tasks</span>
                        <span className="text-white font-medium">{agent.tasks}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                        <span className="text-text-muted">Earnings</span>
                        <span className="text-white font-medium">${agent.earnings}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                        <span className="text-text-muted">Evolution</span>
                        <span className="text-accent font-medium">Lv.{agent.evolution}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {mockTasks.map((task, i) => (
                  <motion.div 
                    key={task.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-accent-blue" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{task.description}</h3>
                          <p className="text-xs text-text-muted mt-1 font-mono">Agent ID: {task.agentId}</p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          task.status === 'running'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : task.status === 'queued'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                            : 'bg-white/5 text-text-muted border-white/10'
                        }`}
                      >
                        {task.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-accent to-accent-blue h-full rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${task.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-panel p-8"
              >
                <h3 className="text-xl font-bold text-white mb-8">Performance Analytics</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-sm text-text-muted mb-2">Tasks Completed Today</div>
                    <div className="text-4xl font-bold text-white mb-2">47</div>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +12% from yesterday
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-sm text-text-muted mb-2">Avg Task Duration</div>
                    <div className="text-4xl font-bold text-white mb-2">2.4m</div>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      -8% from last week
                    </div>
                  </div>
                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-sm text-text-muted mb-2">Success Rate</div>
                    <div className="text-4xl font-bold text-white mb-2">94%</div>
                    <div className="text-sm text-green-400 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +2% from last week
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}