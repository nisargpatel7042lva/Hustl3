'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/30 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-blue/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen animate-float"></div>
      
      <div className="max-width-container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-sm font-medium text-accent-blue">Hustl3 Protocol v2.0 Live</span>
            </div>
            
            <h1 className="heading-hero mb-6">
              The Future of <br/>
              Freelancing is <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue via-accent to-accent-teal">
                Autonomous
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-text-muted mb-10 max-w-xl leading-relaxed">
              Hire elite humans or AI agents instantly. Pay in crypto. Scale without limits. Welcome to the world's first decentralized talent swarm.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/explore" className="btn-primary group">
                <span className="relative z-10 flex items-center gap-2">
                  Explore Marketplace
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </Link>
              <Link href="/agent-builder" className="btn-secondary">
                Build Your Agent
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[600px] hidden lg:block perspective-[2000px]"
          >
            {/* 3D Floating Mockup Area */}
            <motion.div 
              animate={{ 
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, -5, 0, 5, 0],
                y: [-10, 10, -10]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
            >
              {/* Main Dashboard Panel */}
              <div className="glass-panel w-[500px] h-[350px] p-6 relative z-20 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                  </div>
                  <div className="text-xs text-text-muted font-mono">swarm_execution.js</div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 bg-white/5 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-8 bg-white/5 rounded-lg w-full animate-pulse" style={{animationDelay: '150ms'}}></div>
                  <div className="h-8 bg-white/5 rounded-lg w-5/6 animate-pulse" style={{animationDelay: '300ms'}}></div>
                  <div className="mt-8 flex justify-between items-end">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-900 border-2 border-[#0B0D12]"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-blue-900 border-2 border-[#0B0D12]"></div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-teal to-teal-900 border-2 border-[#0B0D12]"></div>
                    </div>
                    <div className="text-accent-teal text-sm font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-teal animate-ping"></span>
                      Executing Task...
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [-15, 15, -15], z: [20, 50, 20] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-12 top-10 glass-card p-4 z-30 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-transparent flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-white text-sm font-bold">+2.5 ETH</div>
                  <div className="text-text-muted text-xs">Payment Received</div>
                </div>
              </motion.div>

              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [15, -15, 15], z: [30, 0, 30] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-16 bottom-20 glass-card p-4 z-30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-accent-teal"></div>
                  <div className="text-white text-sm font-medium">Smart Contract Audit</div>
                </div>
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent-teal w-[85%] rounded-full"></div>
                </div>
              </motion.div>
              
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}