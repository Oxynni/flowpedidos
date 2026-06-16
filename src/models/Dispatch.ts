import { v4 as uuidv4 } from 'uuid';
import { Dispatch, OrderItem } from '../types';

const dispatches: Map<string, Dispatch> = new Map();
let trackingCounter = 5000;

export const DispatchModel = {
  create(data: {
    orderId: string;
    invoiceId: string;
    clientName: string;
    address: string;
    items: OrderItem[];
    carrier: string;
  }): Dispatch {
    const now = new Date();

    const dispatch: Dispatch = {
      id: uuidv4(),
      orderId: data.orderId,
      invoiceId: data.invoiceId,
      clientName: data.clientName,
      address: data.address,
      items: data.items,
      status: 'preparando',
      carrier: data.carrier,
      trackingNumber: `TRK-${now.getFullYear()}-${String(++trackingCounter).padStart(5, '0')}`,
      dispatchedAt: now,
    };

    dispatches.set(dispatch.id, dispatch);
    return dispatch;
  },

  findById(id: string): Dispatch | undefined {
    return dispatches.get(id);
  },

  findByOrderId(orderId: string): Dispatch | undefined {
    return Array.from(dispatches.values()).find(d => d.orderId === orderId);
  },

  findAll(): Dispatch[] {
    return Array.from(dispatches.values())
      .sort((a, b) => b.dispatchedAt.getTime() - a.dispatchedAt.getTime());
  },

  updateStatus(id: string, status: 'preparando' | 'en_transito' | 'entregado' | 'fallido'): Dispatch | undefined {
    const dispatch = dispatches.get(id);
    if (!dispatch) return undefined;
    dispatch.status = status;
    if (status === 'entregado') dispatch.deliveredAt = new Date();
    return dispatch;
  },

  getStats() {
    const all = this.findAll();
    return {
      total: all.length,
      preparando: all.filter(d => d.status === 'preparando').length,
      enTransito: all.filter(d => d.status === 'en_transito').length,
      entregado: all.filter(d => d.status === 'entregado').length,
      fallido: all.filter(d => d.status === 'fallido').length,
    };
  },
};
