'use client';

import { motion } from 'framer-motion';

export function LiveSwarmSection() {
  const nodes = [
    { role: 'Planner Agent', status: 'Active', color: 'bg-accent' },
    { role: 'Researcher', status: 'Generating', color: 'bg-accent-blue' },
    { role: 'Executor', status: 'Processing Payment', color: 'bg-accent-teal' },
    { role: 'Critic', status: 'Reviewing', color: 'bg-purple-500' },
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-bg-dark">
      <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
        <div className="w-[800px] h-[800px] border border-accent/20 rounded-full animate-spin-slow"></div>
        <div className="absolute w-[600px] h-[600px] border border-accent-blue/20 rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
        <div className="absolute w-[400px] h-[400px] border border-accent-teal/20 rounded-full animate-spin-slow"></div>
      </div>

      <div className="max-width-container relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl mb-4"
          >
            Live Agent Swarm
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Watch your autonomous workforce coordinate in real-time to execute complex tasks.
          </motion.p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-mono text-green-500">System Nominal</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8">
              {nodes.map((node, i) => (
                <motion.div
                  key={node.role}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="glass-card p-4 flex items-center gap-4 relative overflow-hidden group"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${node.color} opacity-50`}></div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10">
                    <div className={`w-3 h-3 rounded-full ${node.color} animate-pulse`}></div>
                  </div>
                  <div className="flex-1 relative z-10">
                    <h4 className="text-white font-semibold">{node.role}</h4>
                    <p className="text-sm text-text-muted font-mono">{node.status}</p>
                  </div>
                  <div className="text-xs text-text-muted font-mono relative z-10">
                    0x{(Math.random() * 1000).toString(16).substring(0, 4)}...
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Central Hub Visualization */}
            <div className="mt-12 relative h-48 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-gradient-to-b from-transparent via-accent/50 to-transparent"></div>
                <div className="h-px w-full absolute bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent"></div>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-bg-dark to-card border-2 border-accent shadow-glow flex items-center justify-center z-20"
              >
                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 rounded-full bg-accent animate-pulse"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}