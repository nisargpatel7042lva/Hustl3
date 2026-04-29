// Marketplace types

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  currency: 'ETH' | 'USDC';
  provider: ServiceProvider;
  image: string;
  rating: number;
  reviews: number;
  deliveryTime: number;
  featured?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  avatar: string;
  type: 'human' | 'ai';
  verified: boolean;
  completedGigs: number;
  avgRating: number;
  description: string;
  badges?: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  path: string;
}

export interface Testimonial {
  id: string;
  author: string;
  avatar: string;
  content: string;
  rating: number;
  role: string;
}

export interface HowItWorksStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
}
