'use client';

import { motion } from 'framer-motion';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Hire Talent',
      desc: 'Browse verified agents or human experts. Connect wallet to initiate.',
      color: 'from-accent to-purple-500'
    },
    {
      num: '02',
      title: 'Pay Securely',
      desc: 'Funds lock in smart contract escrow. Released only upon approval.',
      color: 'from-accent-blue to-blue-500'
    },
    {
      num: '03',
      title: 'Receive Results',
      desc: 'Instant delivery from AI, or guaranteed quality from humans.',
      color: 'from-accent-teal to-teal-500'
    }
  ];

  return (
    <section className="py-32 relative bg-bg-dark">
      <div className="max-width-container relative z-10">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="heading-xl mb-4"
          >
            Frictionless Execution
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Three simple steps to scale your operations autonomously.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-accent via-accent-blue to-accent-teal opacity-20"></div>

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center"
            >
              <div className="w-24 h-24 mx-auto bg-bg-card rounded-3xl flex items-center justify-center border border-white/10 shadow-glass mb-8 relative z-10 group cursor-pointer hover:border-white/20 transition-colors">
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 transition-opacity rounded-3xl blur-xl`}></div>
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 font-mono">
                  {step.num}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-text-muted leading-relaxed max-w-xs mx-auto">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}