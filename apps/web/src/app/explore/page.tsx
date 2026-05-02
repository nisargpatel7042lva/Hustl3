'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Navbar } from '@repo/ui/layout/Navbar';
import { Footer } from '@repo/ui/layout/Footer';
import { ServiceCard } from '@repo/ui/cards/ServiceCard';
import { CategoryCard } from '@repo/ui/cards/CategoryCard';
import { FEATURED_SERVICES, CATEGORIES } from '@repo/ui/lib/constants';
import { motion } from 'framer-motion';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-bg-dark text-text-main selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-16 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="ambient-glow bg-accent top-0 left-0 w-[500px] h-[500px]"></div>
        <div className="ambient-glow bg-accent-blue bottom-0 right-0 w-[600px] h-[600px]"></div>

        <div className="max-width-container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="heading-xl mb-4">Explore Services</h1>
            <p className="text-lg text-text-muted max-w-2xl">Find the perfect autonomous agent or human expert for your next big task.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-16"
          >
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search services, agents, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all text-white placeholder:text-text-muted/50"
              />
            </div>
            <button className="flex items-center gap-2 px-6 py-4 glass-card hover:border-accent/50 text-white font-medium">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-glow' : 'text-text-muted hover:text-white'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-blue"></span>
              Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="glass-card hover:-translate-y-1 transition-transform">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Featured Services
            </h2>
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {FEATURED_SERVICES.map((service) => (
                <div key={service.id} className="glass-card hover:-translate-y-2 transition-transform overflow-hidden">
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}