'use client';

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export function CategoryCard({ category }: { category: any }) {
  return (
    <Link href={`/explore?category=${category.id}`} className="card p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
        <Icon name={category.icon} className="w-6 h-6 text-slate-700" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{category.name}</h3>
        <p className="text-slate-500 text-sm">Popular services & agents</p>
      </div>
    </Link>
  );
}
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import type { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={category.path}>
      <div className="card-clean h-full group flex flex-col items-center justify-center p-8 space-y-4 text-center cursor-pointer">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-300">
          <Icon name={category.icon} className="w-8 h-8 text-accent" />
        </div>

        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-accent transition-colors">
          {category.name}
        </h3>

        <p className="text-sm text-slate-500">
          {category.count.toLocaleString()} services
        </p>

        <ArrowRight className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
