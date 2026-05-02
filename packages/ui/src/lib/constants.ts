import type { Category, ServiceProvider, Service, Testimonial, HowItWorksStep } from '@repo/ui/types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Design & Creative',
    icon: 'Palette',
    count: 0,
    path: '/explore?category=design',
  },
  {
    id: '2',
    name: 'Development',
    icon: 'Code',
    count: 0,
    path: '/explore?category=development',
  },
  {
    id: '3',
    name: 'Content Writing',
    icon: 'PenTool',
    count: 0,
    path: '/explore?category=writing',
  },
  {
    id: '4',
    name: 'AI Services',
    icon: 'Bot',
    count: 0,
    path: '/explore?category=ai',
  },
  {
    id: '5',
    name: 'Marketing',
    icon: 'BarChart3',
    count: 0,
    path: '/explore?category=marketing',
  },
  {
    id: '6',
    name: 'Business',
    icon: 'Briefcase',
    count: 0,
    path: '/explore?category=business',
  },
];

export const FEATURED_FREELANCERS: ServiceProvider[] = [];

export const FEATURED_AI_AGENTS: ServiceProvider[] = [];

export const FEATURED_SERVICES: Service[] = [];

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    id: '1',
    number: 1,
    title: 'Browse & Select',
    description: 'Browse thousands of services from verified sellers or let AI handle it instantly.',
    icon: 'Search',
  },
  {
    id: '2',
    number: 2,
    title: 'Secure Payment',
    description: 'Your payment is held in smart contract escrow. Only released when you approve.',
    icon: 'Shield',
  },
  {
    id: '3',
    number: 3,
    title: 'Get Results',
    description: 'Receive your completed service instantly (AI) or on schedule (human).',
    icon: 'CheckCircle',
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'James Chen',
    avatar: 'JC',
    content: 'Got my entire dApp interface designed in under 48 hours. The AI quality was incredible.',
    rating: 5,
    role: 'Founder, Web3Startup',
  },
  {
    id: '2',
    author: 'Lisa Moon',
    avatar: 'LM',
    content: 'Found a smart contract expert instantly. The escrow system made me feel completely safe.',
    rating: 5,
    role: 'CTO, DeFiProtocol',
  },
  {
    id: '3',
    author: 'Marcus Thompson',
    avatar: 'MT',
    content: 'The AI agents are game-changing. Instant delivery at a fraction of the cost.',
    rating: 5,
    role: 'Indie Hacker',
  },
  {
    id: '4',
    author: 'Elena Rodriguez',
    avatar: 'ER',
    content: 'Hustl3 transformed how I run my agency. Best platform for web3 services.',
    rating: 5,
    role: 'Agency Owner',
  },
];

export const FOOTER_LINKS = {
  product: [
    { label: 'Explore', href: '/explore' },
    { label: 'Become Seller', href: '/seller' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'License', href: '/license' },
  ],
  social: [
    { label: 'Twitter', href: 'https://twitter.com/hustl3' },
    { label: 'Discord', href: 'https://discord.gg/hustl3' },
    { label: 'GitHub', href: 'https://github.com/hustl3' },
  ],
};