'use client';

import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';

export function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="max-width-container">
        <div className="text-center mb-12">
          <h2 className="heading-lg text-slate-900 mb-4">
            Loved by Creators & Builders
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            See what our community has to say about Hustl3
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card-clean p-6 flex flex-col space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{testimonial.avatar}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-slate-500 truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-accent text-accent"
                  />
                ))}
              </div>

              <p className="text-slate-600 leading-relaxed flex-1 text-sm">
                &ldquo;{testimonial.content}&rdquo;
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-600 mb-4">
            Join thousands of creators and builders
          </p>
          <button className="btn-accent">
            Start Earning Today
          </button>
        </div>
      </div>
    </section>
  );
}
