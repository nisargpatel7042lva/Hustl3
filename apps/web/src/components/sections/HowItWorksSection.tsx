'use client';

import { Icon } from '@/components/ui/Icon';
import { HOW_IT_WORKS } from '@/lib/constants';

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-slate-50">
      <div className="max-width-container">
        <div className="text-center mb-16">
          <h2 className="heading-lg text-slate-900 mb-4">
            How It Works
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Get started in minutes. Secure payments. Trusted transactions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.id} className="relative text-center">
              <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center mx-auto mb-6">
                <Icon name={step.icon} className="w-8 h-8" />
              </div>
              <h3 className="heading-md text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
