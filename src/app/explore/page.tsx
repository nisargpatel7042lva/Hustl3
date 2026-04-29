'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { FEATURED_SERVICES, CATEGORIES } from '@/lib/constants';

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-width-container px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="heading-xl text-slate-900 mb-4">Explore Services</h1>
            <p className="text-lg text-slate-600">Find the perfect service for your needs</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-accent transition-colors">
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'bg-slate-50'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'bg-slate-50'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Featured Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_SERVICES.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}