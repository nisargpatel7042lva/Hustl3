'use client';

import { useState } from 'react';
import { Plus, Trash2, Code, Play, Save, Zap, Bot } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillInput {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  code: string;
  inputs: SkillInput[];
}

interface AgentBuilder {
  name: string;
  description: string;
  skills: Skill[];
}

export default function AgentBuilderPage() {
  const [builder, setBuilder] = useState<AgentBuilder>({
    name: '',
    description: '',
    skills: [],
  });
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  const addSkill = () => {
    setBuilder({
      ...builder,
      skills: [
        ...builder.skills,
        {
          id: `skill_${Date.now()}`,
          name: '',
          description: '',
          code: 'function handler(input) {\n  return { result: input };\n}',
          inputs: [],
        },
      ],
    });
  };

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...builder.skills];
    newSkills[index] = { ...newSkills[index], ...updates };
    setBuilder({ ...builder, skills: newSkills });
  };

  const removeSkill = (index: number) => {
    setBuilder({
      ...builder,
      skills: builder.skills.filter((_, i) => i !== index),
    });
  };

  const addInput = (skillIndex: number) => {
    const skill = builder.skills[skillIndex];
    const newInput: SkillInput = {
      id: `input_${Date.now()}`,
      name: '',
      type: 'string',
      required: false,
      description: '',
    };
    updateSkill(skillIndex, { inputs: [...skill.inputs, newInput] });
  };

  const runAgent = async () => {
    setIsRunning(true);
    setOutput('Executing agent...\n');

    await new Promise((resolve) => setTimeout(resolve, 1500));

    setOutput(`Agent: ${builder.name || 'Unnamed Agent'}\n`);
    setOutput((prev) => prev + `Skills loaded: ${builder.skills.length}\n`);
    setOutput((prev) => prev + `\nExecution complete.\n`);
    setOutput((prev) => prev + `- Skills executed successfully\n`);
    setOutput((prev) => prev + `- Results stored to 0G Storage\n`);

    setIsRunning(false);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-main selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="ambient-glow bg-accent-teal top-0 right-1/4 w-[500px] h-[500px]"></div>

        <div className="max-width-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="heading-xl mb-4">Agent Builder</h1>
            <p className="text-lg text-text-muted">Create, configure, and test your autonomous AI agents on-chain.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-accent" />
                  Agent Configuration
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Agent Name</label>
                    <input
                      type="text"
                      value={builder.name}
                      onChange={(e) => setBuilder({ ...builder, name: e.target.value })}
                      placeholder="e.g., Data Collector Pro"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Description</label>
                    <textarea
                      value={builder.description}
                      onChange={(e) => setBuilder({ ...builder, description: e.target.value })}
                      placeholder="What does this agent do?"
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-accent/50 text-white transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-accent-teal" />
                    Skills
                  </h2>
                  <button onClick={addSkill} className="btn-secondary px-4 py-2 text-xs flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>

                {builder.skills.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-white/10 rounded-xl bg-white/5">
                    <Code className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-50" />
                    <p className="text-text-muted text-sm">
                      No skills added yet.<br />Click "Add Skill" to start building.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {builder.skills.map((skill, index) => (
                        <motion.div 
                          key={skill.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border border-white/10 bg-white/5 rounded-xl p-4 relative group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => updateSkill(index, { name: e.target.value })}
                              placeholder="Skill name (e.g., fetch_data)"
                              className="text-sm font-medium bg-transparent border-none focus:outline-none text-white w-2/3"
                            />
                            <button
                              onClick={() => removeSkill(index)}
                              className="text-text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="relative rounded-lg overflow-hidden border border-white/10">
                            <div className="absolute top-0 left-0 w-full h-8 bg-black/40 flex items-center px-3 border-b border-white/5">
                              <span className="text-[10px] font-mono text-text-muted">JavaScript</span>
                            </div>
                            <textarea
                              value={skill.code}
                              onChange={(e) => updateSkill(index, { code: e.target.value })}
                              placeholder="// Skill code"
                              rows={6}
                              className="w-full px-4 pt-10 pb-4 bg-black/20 text-accent-teal font-mono text-sm focus:outline-none resize-none"
                            />
                          </div>

                          <div className="mt-4 flex justify-end">
                            <button
                              onClick={() => addInput(index)}
                              className="text-xs text-accent-blue hover:text-accent-teal transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Input
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-accent-blue" />
                    Preview & Test
                  </h2>
                  <button
                    onClick={runAgent}
                    disabled={isRunning || builder.skills.length === 0}
                    className="btn-primary px-6 py-2 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? 'Running...' : 'Run Agent'}
                    <Play className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-black/40 border border-white/10 rounded-xl p-4 min-h-[300px] font-mono text-sm relative">
                  <div className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center px-3 border-b border-white/5 rounded-t-xl">
                    <span className="text-[10px] text-text-muted">Terminal Output</span>
                  </div>
                  <pre className="text-green-400 pt-8 whitespace-pre-wrap">
                    {output || '> Waiting for execution...\n> Click "Run Agent" to test.'}
                    {isRunning && <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1 align-middle"></span>}
                  </pre>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="btn-secondary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Deploy to Network
                  </button>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-semibold text-white mb-4">Live Metrics</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-accent">{builder.skills.length}</div>
                    <div className="text-xs text-text-muted mt-1">Skills</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-accent-blue">0</div>
                    <div className="text-xs text-text-muted mt-1">Executions</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="text-2xl font-bold text-accent-teal">Lv.1</div>
                    <div className="text-xs text-text-muted mt-1">Evolution</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}