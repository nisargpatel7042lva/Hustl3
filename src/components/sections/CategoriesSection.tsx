'use client';

import { CATEGORIES } from '@/lib/constants';
import { CategoryCard } from '@/components/cards/CategoryCard';

export function CategoriesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-bg/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg text-white mb-4">
            Explore Categories
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Find services across diverse categories, from AI-powered solutions to human expertise
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="btn-secondary">
            Browse All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
