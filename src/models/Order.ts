import { v4 as uuidv4 } from 'uuid';
import { Order, OrderItem, OrderStatus, PaymentMethod } from '../types';

const orders: Map<string, Order> = new Map();

function calculateTotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.subtotal, 0);
}

export const OrderModel = {
  create(data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    items: Omit<OrderItem, 'subtotal'>[];
    paymentMethod: PaymentMethod;
    notes?: string;
    createdAt?: Date;
  }): Order {
    const now = data.createdAt || new Date();
    const items: OrderItem[] = data.items.map(item => ({
      ...item,
      subtotal: item.quantity * item.unitPrice,
    }));

    const order: Order = {
      id: uuidv4(),
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      clientPhone: data.clientPhone,
      items,
      total: calculateTotal(items),
      status: 'pendiente',
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    orders.set(order.id, order);
    return order;
  },

  findById(id: string): Order | undefined {
    return orders.get(id);
  },

  findAll(): Order[] {
    return Array.from(orders.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  findByStatus(status: OrderStatus): Order[] {
    return this.findAll().filter(o => o.status === status);
  },

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    const order = orders.get(id);
    if (!order) return undefined;
    order.status = status;
    order.updatedAt = new Date();
    return order;
  },

  delete(id: string): boolean {
    return orders.delete(id);
  },

  getStats() {
    const all = this.findAll();
    return {
      total: all.length,
      pendiente: all.filter(o => o.status === 'pendiente').length,
      facturado: all.filter(o => o.status === 'facturado').length,
      despachado: all.filter(o => o.status === 'despachado').length,
      entregado: all.filter(o => o.status === 'entregado').length,
      cancelado: all.filter(o => o.status === 'cancelado').length,
      ingresos: all
        .filter(o => o.status !== 'cancelado')
        .reduce((sum, o) => sum + o.total, 0),
    };
  },
};
