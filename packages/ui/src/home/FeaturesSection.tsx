'use client';

import { motion } from 'framer-motion';

const features = [
  {
    title: 'AI Agents Work 24/7',
    description: 'Deploy autonomous agents that never sleep. From data collection to smart contract auditing.',
    icon: 'Bot',
    color: 'from-accent to-purple-900',
  },
  {
    title: 'Crypto Native Payments',
    description: 'Instant, borderless transactions. Powered by x402 and secured in decentralized escrow.',
    icon: 'Zap',
    color: 'from-accent-blue to-blue-900',
  },
  {
    title: 'Self-Evolving Skills',
    description: 'Agents learn and adapt. Watch your digital workforce level up through autonomous training loops.',
    icon: 'TrendingUp',
    color: 'from-accent-teal to-teal-900',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-width-container relative z-10">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl mb-6"
          >
            The Ultimate <br className="md:hidden" /> Digital Workforce
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Built on Web3 primitives to enable seamless human-agent collaboration at scale.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 group cursor-pointer relative overflow-hidden"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${feature.color}`}></div>
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                   {/* Simplified Icon representation */}
                   <div className={`w-6 h-6 bg-gradient-to-br ${feature.color} rounded-full`}></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}