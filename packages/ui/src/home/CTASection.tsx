'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-40 relative overflow-hidden">
      <div className="absolute inset-0 bg-bg-card"></div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      
      {/* Core Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-accent via-accent-blue to-accent-teal rounded-full blur-[150px] opacity-20 pointer-events-none mix-blend-screen"></div>

      <div className="max-width-container relative z-10 text-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70"
        >
          Build Your <br />
          Autonomous Workforce
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-text-muted mb-12 max-w-2xl mx-auto font-medium"
        >
          Join the decentralized talent network today. Scale operations with intelligent agents and premium human talent.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
        >
          <Link href="/explore" className="btn-primary w-full sm:w-auto text-lg px-12 py-4">
            Start Now
          </Link>
          <Link href="#" className="btn-secondary w-full sm:w-auto text-lg px-12 py-4 group">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Watch Demo
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}