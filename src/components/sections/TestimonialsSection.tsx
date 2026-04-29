'use client';

import { Star } from 'lucide-react';
import { TESTIMONIALS } from '@/lib/constants';

export function TestimonialsSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-dark-bg/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg text-white mb-4">
            Loved by Creators & Builders
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            See what our community has to say about Hustl3
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="card-premium p-6 flex flex-col space-y-4"
            >
              {/* Avatar and Author */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{testimonial.avatar}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white truncate">
                    {testimonial.author}
                  </h4>
                  <p className="text-sm text-gray-400 truncate">
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-neon-cyan text-neon-cyan"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed flex-1">
                "{testimonial.content}"
              </p>

              {/* Quote Mark */}
              <div className="text-4xl text-neon-cyan/30 font-bold leading-none">
                "
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">
            Join thousands of creators and builders
          </p>
          <button className="btn-primary">
            Start Earning Today
          </button>
        </div>
      </div>
    </section>
  );
}
