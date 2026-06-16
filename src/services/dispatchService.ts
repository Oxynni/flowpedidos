import { DispatchModel } from '../models/Dispatch';
import { Dispatch } from '../types';

export const DispatchService = {
  getById(id: string): Dispatch | undefined {
    return DispatchModel.findById(id);
  },

  getByOrderId(orderId: string): Dispatch | undefined {
    return DispatchModel.findByOrderId(orderId);
  },

  getAll(): Dispatch[] {
    return DispatchModel.findAll();
  },

  getStats() {
    return DispatchModel.getStats();
  },

  advanceStatus(id: string): Dispatch | undefined {
    const dispatch = DispatchModel.findById(id);
    if (!dispatch) return undefined;

    const flow: Record<string, 'preparando' | 'en_transito' | 'entregado' | 'fallido'> = {
      preparando: 'en_transito',
      en_transito: 'entregado',
    };

    const next = flow[dispatch.status];
    if (!next) return undefined;

    return DispatchModel.updateStatus(id, next);
  },

  markAsFailed(id: string): Dispatch | undefined {
    return DispatchModel.updateStatus(id, 'fallido');
  },
};
