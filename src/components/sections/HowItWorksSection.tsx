'use client';

import { HOW_IT_WORKS } from '@/lib/constants';

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg text-white mb-4">
            How It Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Get started in minutes. Secure payments. Trusted transactions.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {HOW_IT_WORKS.map((step, index) => (
            <div
              key={step.id}
              className="relative flex gap-8 md:gap-12"
            >
              {/* Connector Line */}
              {index < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute left-16 top-24 w-0.5 h-24 bg-gradient-to-b from-neon-cyan to-neon-purple opacity-50" />
              )}

              {/* Step Circle */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-32 h-32 rounded-full bg-gradient-neon text-black font-bold text-4xl shadow-neon-cyan">
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pt-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="heading-md text-white">
                      Step {step.number}: {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 space-y-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-primary">
              Get Started Now
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
