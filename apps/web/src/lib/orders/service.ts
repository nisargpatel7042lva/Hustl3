import {
  Order,
  OrderStatus,
  CreateOrderRequest,
  OrderApiResponse,
} from '@/types';
import { orderRepository } from './repository';
import type { OrderRepository } from './repository';

export interface OrderServiceErrors {
  INVALID_INPUT: { code: 'INVALID_INPUT'; message: string; details?: Record<string, string> };
  ORDER_NOT_FOUND: { code: 'ORDER_NOT_FOUND'; message: string };
  SELF_ORDERING: { code: 'SELF_ORDERING'; message: string };
  UNAUTHORIZED: { code: 'UNAUTHORIZED'; message: string };
  INVALID_STATUS_TRANSITION: { code: 'INVALID_STATUS_TRANSITION'; message: string };
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR'; message: string };
}

const errors: OrderServiceErrors = {
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    message: 'Invalid input provided',
  },
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    message: 'Order not found',
  },
  SELF_ORDERING: {
    code: 'SELF_ORDERING',
    message: 'Buyers cannot order their own services',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized action',
  },
  INVALID_STATUS_TRANSITION: {
    code: 'INVALID_STATUS_TRANSITION',
    message: 'Invalid status transition for this order',
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'An internal error occurred',
  },
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['DELIVERED', 'DISPUTED'],
  DELIVERED: ['APPROVED', 'DISPUTED'],
  APPROVED: [],
  DISPUTED: ['REFUNDED', 'APPROVED'],
  REFUNDED: [],
  CANCELLED: [],
};

function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

function validateWallet(wallet: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet);
}

function validateCreateOrder(data: CreateOrderRequest): Record<string, string> | null {
  const issues: Record<string, string> = {};

  if (!data.serviceId || typeof data.serviceId !== 'string') {
    issues.serviceId = 'Service ID is required';
  }
  if (!data.buyerWallet || !validateWallet(data.buyerWallet)) {
    issues.buyerWallet = 'Valid buyer wallet address is required';
  }
  if (!data.sellerWallet || !validateWallet(data.sellerWallet)) {
    issues.sellerWallet = 'Valid seller wallet address is required';
  }
  if (data.amount === undefined || data.amount <= 0) {
    issues.amount = 'Amount must be greater than 0';
  }
  if (!['ETH', 'USDC'].includes(data.currency)) {
    issues.currency = 'Currency must be ETH or USDC';
  }
  if (!['SERVICE', 'AI_INSTANT'].includes(data.type)) {
    issues.type = 'Type must be SERVICE or AI_INSTANT';
  }

  return Object.keys(issues).length > 0 ? issues : null;
}

export interface OrderService {
  createOrder(data: CreateOrderRequest, serviceTitle: string): OrderApiResponse<Order>;
  getOrder(id: string): OrderApiResponse<Order>;
  markDelivered(id: string, sellerWallet: string, deliveryData?: string): OrderApiResponse<Order>;
  approveOrder(id: string, buyerWallet: string): OrderApiResponse<Order>;
  disputeOrder(id: string, wallet: string, reason: string): OrderApiResponse<Order>;
  getOrdersByWallet(wallet: string): OrderApiResponse<Order[]>;
}

export function createOrderService(repository: OrderRepository): OrderService {
  return {
    createOrder(data: CreateOrderRequest, serviceTitle: string): OrderApiResponse<Order> {
      try {
        const validationErrors = validateCreateOrder(data);
        if (validationErrors) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, details: validationErrors },
          };
        }

        if (data.buyerWallet.toLowerCase() === data.sellerWallet.toLowerCase()) {
          return {
            success: false,
            error: { ...errors.SELF_ORDERING },
          };
        }

        const order = repository.create(data, serviceTitle);
        return { success: true, data: order };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },

    getOrder(id: string): OrderApiResponse<Order> {
      try {
        if (!id) {
          return { success: false, error: { ...errors.INVALID_INPUT, message: 'Order ID is required' } };
        }

        const order = repository.findById(id);
        if (!order) {
          return { success: false, error: { ...errors.ORDER_NOT_FOUND } };
        }

        return { success: true, data: order };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },

    markDelivered(id: string, sellerWallet: string, deliveryData?: string): OrderApiResponse<Order> {
      try {
        if (!id || !sellerWallet || !validateWallet(sellerWallet)) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, message: 'Valid order ID and seller wallet required' },
          };
        }

        const order = repository.findById(id);
        if (!order) {
          return { success: false, error: { ...errors.ORDER_NOT_FOUND } };
        }

        if (order.sellerWallet !== sellerWallet.toLowerCase()) {
          return { success: false, error: { ...errors.UNAUTHORIZED } };
        }

        if (!canTransition(order.status, 'DELIVERED')) {
          return {
            success: false,
            error: { ...errors.INVALID_STATUS_TRANSITION, message: `Cannot mark as delivered from ${order.status} status` },
          };
        }

        const updated = repository.update(id, {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          deliveryData,
        });

        return { success: true, data: updated! };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },

    approveOrder(id: string, buyerWallet: string): OrderApiResponse<Order> {
      try {
        if (!id || !buyerWallet || !validateWallet(buyerWallet)) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, message: 'Valid order ID and buyer wallet required' },
          };
        }

        const order = repository.findById(id);
        if (!order) {
          return { success: false, error: { ...errors.ORDER_NOT_FOUND } };
        }

        if (order.buyerWallet !== buyerWallet.toLowerCase()) {
          return { success: false, error: { ...errors.UNAUTHORIZED } };
        }

        if (!canTransition(order.status, 'APPROVED')) {
          return {
            success: false,
            error: { ...errors.INVALID_STATUS_TRANSITION, message: `Cannot approve from ${order.status} status` },
          };
        }

        const updated = repository.update(id, {
          status: 'APPROVED',
          approvedAt: new Date(),
        });

        return { success: true, data: updated! };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },

    disputeOrder(id: string, wallet: string, reason: string): OrderApiResponse<Order> {
      try {
        if (!id || !wallet || !validateWallet(wallet)) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, message: 'Valid order ID and wallet required' },
          };
        }

        if (!reason || reason.trim().length < 10) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, message: 'Dispute reason must be at least 10 characters' },
          };
        }

        const order = repository.findById(id);
        if (!order) {
          return { success: false, error: { ...errors.ORDER_NOT_FOUND } };
        }

        const lowerWallet = wallet.toLowerCase();
        const isBuyer = order.buyerWallet === lowerWallet;
        const isSeller = order.sellerWallet === lowerWallet;

        if (!isBuyer && !isSeller) {
          return { success: false, error: { ...errors.UNAUTHORIZED } };
        }

        if (!canTransition(order.status, 'DISPUTED')) {
          return {
            success: false,
            error: { ...errors.INVALID_STATUS_TRANSITION, message: `Cannot dispute from ${order.status} status` },
          };
        }

        const updated = repository.update(id, {
          status: 'DISPUTED',
          disputedAt: new Date(),
          disputeReason: reason.trim(),
        });

        return { success: true, data: updated! };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },

    getOrdersByWallet(wallet: string): OrderApiResponse<Order[]> {
      try {
        if (!wallet || !validateWallet(wallet)) {
          return {
            success: false,
            error: { ...errors.INVALID_INPUT, message: 'Valid wallet address required' },
          };
        }

        const orders = repository.findByWallet(wallet);
        return { success: true, data: orders };
      } catch {
        return { success: false, error: { ...errors.INTERNAL_ERROR } };
      }
    },
  };
}

export const orderService = createOrderService(orderRepository);
