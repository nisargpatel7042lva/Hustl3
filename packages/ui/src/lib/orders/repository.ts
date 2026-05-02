import { Order, OrderStatus, CreateOrderRequest } from '@repo/ui/types';

const orders: Map<string, Order> = new Map();

function generateId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface OrderRepository {
  create(data: CreateOrderRequest, serviceTitle: string): Order;
  findById(id: string): Order | undefined;
  findByBuyerWallet(wallet: string): Order[];
  findBySellerWallet(wallet: string): Order[];
  findByWallet(wallet: string): Order[];
  update(id: string, data: Partial<Order>): Order | undefined;
  updateStatus(id: string, status: OrderStatus): Order | undefined;
}

export function createOrderRepository(): OrderRepository {
  return {
    create(data: CreateOrderRequest, serviceTitle: string): Order {
      const now = new Date();
      const order: Order = {
        id: generateId(),
        serviceId: data.serviceId,
        serviceTitle,
        buyerWallet: data.buyerWallet.toLowerCase(),
        sellerWallet: data.sellerWallet.toLowerCase(),
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        type: data.type,
        createdAt: now,
        updatedAt: now,
      };
      orders.set(order.id, order);
      return order;
    },

    findById(id: string): Order | undefined {
      return orders.get(id);
    },

    findByBuyerWallet(wallet: string): Order[] {
      const lowerWallet = wallet.toLowerCase();
      return Array.from(orders.values()).filter(
        (order) => order.buyerWallet === lowerWallet
      );
    },

    findBySellerWallet(wallet: string): Order[] {
      const lowerWallet = wallet.toLowerCase();
      return Array.from(orders.values()).filter(
        (order) => order.sellerWallet === lowerWallet
      );
    },

    findByWallet(wallet: string): Order[] {
      const lowerWallet = wallet.toLowerCase();
      return Array.from(orders.values()).filter(
        (order) => order.buyerWallet === lowerWallet || order.sellerWallet === lowerWallet
      );
    },

    update(id: string, data: Partial<Order>): Order | undefined {
      const order = orders.get(id);
      if (!order) return undefined;

      const updated: Order = {
        ...order,
        ...data,
        updatedAt: new Date(),
      };
      orders.set(id, updated);
      return updated;
    },

    updateStatus(id: string, status: OrderStatus): Order | undefined {
      const order = orders.get(id);
      if (!order) return undefined;

      order.status = status;
      order.updatedAt = new Date();
      orders.set(id, order);
      return order;
    },
  };
}

export const orderRepository = createOrderRepository();