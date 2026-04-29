'use client';

import { CATEGORIES } from '@/lib/constants';
import { CategoryCard } from '@/components/cards/CategoryCard';

export function CategoriesSection() {
  return (
    <section className="section-padding">
      <div className="max-width-container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-slate-900 mb-4">
            Explore Categories
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Find services across diverse categories, from AI-powered solutions to human expertise
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="btn-outline">
            Browse All Categories
          </button>
        </div>
      </div>
    </section>
  );
}