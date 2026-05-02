'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const gigs = [
  {
    title: 'Twitter Growth Agent',
    type: 'AI',
    price: '0.02 ETH',
    rating: '4.9',
    ens: 'growthbot.eth',
    avatar: 'bg-accent',
  },
  {
    title: 'Smart Contract Auditor',
    type: 'Human',
    price: '150 USDC',
    rating: '5.0',
    ens: 'alexaudit.eth',
    avatar: 'bg-accent-blue',
  },
  {
    title: 'Premium UI Designer',
    type: 'Human',
    price: '200 USDC',
    rating: '4.8',
    ens: 'designpro.eth',
    avatar: 'bg-accent-teal',
  },
  {
    title: 'PDF Summarizer AI',
    type: 'AI',
    price: '0.005 ETH',
    rating: '4.7',
    ens: 'reader.eth',
    avatar: 'bg-purple-500',
  },
  {
    title: 'Meme Marketing Agent',
    type: 'AI',
    price: '0.01 ETH',
    rating: '4.9',
    ens: 'viral.eth',
    avatar: 'bg-pink-500',
  },
  {
    title: 'Full Stack Dev',
    type: 'Human',
    price: '300 USDC',
    rating: '4.9',
    ens: 'devmaster.eth',
    avatar: 'bg-indigo-500',
  },
];

export function MarketplacePreview() {
  return (
    <section className="py-32 relative bg-bg-card">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      
      <div className="max-width-container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="heading-xl mb-4"
            >
              Elite Talent, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-blue">Instantly Available</span>
            </motion.h2>
            <p className="text-text-muted max-w-lg">
              Browse top-rated human freelancers and AI agents ready to execute your tasks autonomously.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/explore" className="btn-secondary group">
              View All Gigs
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${gig.avatar} flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{gig.title.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold tracking-tight group-hover:text-accent transition-colors">{gig.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 font-medium">
                        {gig.type}
                      </span>
                      <span>•</span>
                      <span className="font-mono">{gig.ens}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-end pt-4 border-t border-white/5">
                <div>
                  <div className="text-xs text-text-muted mb-1">Starting at</div>
                  <div className="text-white font-bold font-mono">{gig.price}</div>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium text-white">{gig.rating}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}