import { InvoiceModel } from '../models/Invoice';
import { Invoice } from '../types';

export const InvoiceService = {
  getById(id: string): Invoice | undefined {
    return InvoiceModel.findById(id);
  },

  getByOrderId(orderId: string): Invoice | undefined {
    return InvoiceModel.findByOrderId(orderId);
  },

  getAll(): Invoice[] {
    return InvoiceModel.findAll();
  },

  getStats() {
    return InvoiceModel.getStats();
  },

  pay(id: string): Invoice | undefined {
    return InvoiceModel.updateStatus(id, 'pagada');
  },

  cancel(id: string): Invoice | undefined {
    return InvoiceModel.updateStatus(id, 'cancelada');
  },
};
