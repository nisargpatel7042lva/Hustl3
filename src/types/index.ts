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

export type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'APPROVED' | 'DISPUTED' | 'REFUNDED' | 'CANCELLED';

export type OrderType = 'SERVICE' | 'AI_INSTANT';

export interface Order {
  id: string;
  serviceId: string;
  serviceTitle: string;
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  currency: 'ETH' | 'USDC';
  status: OrderStatus;
  type: OrderType;
  deliveryData?: string;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  approvedAt?: Date;
  disputedAt?: Date;
  disputeReason?: string;
  disputeResolution?: 'REFUND' | 'RELEASE' | 'PENDING';
}

export interface CreateOrderRequest {
  serviceId: string;
  buyerWallet: string;
  sellerWallet: string;
  amount: number;
  currency: 'ETH' | 'USDC';
  type: OrderType;
}

export interface DisputeRequest {
  reason: string;
}

export interface OrderApiResponse<T = Order> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
