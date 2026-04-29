'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.path}>
      <div className="card-premium h-full group flex flex-col items-center justify-center p-8 space-y-4 text-center cursor-pointer">
        {/* Icon */}
        <div className="text-5xl group-hover:scale-125 group-hover:rotate-3 transition-all duration-300">
          {category.icon}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-white group-hover:text-neon-cyan transition-colors">
          {category.name}
        </h3>

        {/* Count */}
        <p className="text-sm text-gray-400">
          {category.count.toLocaleString()} services
        </p>

        {/* Arrow */}
        <ArrowRight className="w-5 h-5 text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
