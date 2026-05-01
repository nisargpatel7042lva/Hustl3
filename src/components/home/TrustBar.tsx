'use client';

import { motion } from 'framer-motion';

export function TrustBar() {
  const partners = [
    { name: '0G', logo: '0G' },
    { name: 'ENS', logo: 'ENS' },
    { name: 'Uniswap', logo: 'Uniswap' },
    { name: 'KeeperHub', logo: 'KeeperHub' },
    { name: 'Gensyn', logo: 'Gensyn' },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-transparent to-bg-dark z-10 pointer-events-none"></div>
      
      <div className="max-width-container">
        <p className="text-center text-sm font-medium text-text-muted mb-8 uppercase tracking-widest">
          Powered by industry leaders
        </p>
        
        <div className="flex justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          {partners.map((partner, i) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-xl md:text-2xl font-bold text-white tracking-wider flex items-center gap-2 hover:text-accent transition-colors cursor-default"
            >
              {/* Placeholder for actual SVGs, using text for now to maintain layout */}
              {partner.logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}