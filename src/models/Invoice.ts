import { v4 as uuidv4 } from 'uuid';
import { Invoice, OrderItem } from '../types';

const invoices: Map<string, Invoice> = new Map();
let invoiceCounter = 1000;

export const InvoiceModel = {
  createFromOrder(data: {
    orderId: string;
    clientName: string;
    clientEmail: string;
    items: OrderItem[];
    total: number;
  }): Invoice {
    const tax = data.total * 0.16;
    const now = new Date();

    const invoice: Invoice = {
      id: uuidv4(),
      orderId: data.orderId,
      invoiceNumber: `FAC-${now.getFullYear()}-${String(++invoiceCounter).padStart(5, '0')}`,
      clientName: data.clientName,
      clientEmail: data.clientEmail,
      items: data.items,
      subtotal: data.total,
      tax: Math.round(tax * 100) / 100,
      total: data.total + Math.round(tax * 100) / 100,
      status: 'emitida',
      issuedAt: now,
    };

    invoices.set(invoice.id, invoice);
    return invoice;
  },

  findById(id: string): Invoice | undefined {
    return invoices.get(id);
  },

  findByOrderId(orderId: string): Invoice | undefined {
    return Array.from(invoices.values()).find(inv => inv.orderId === orderId);
  },

  findAll(): Invoice[] {
    return Array.from(invoices.values())
      .sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
  },

  updateStatus(id: string, status: 'emitida' | 'pagada' | 'cancelada'): Invoice | undefined {
    const invoice = invoices.get(id);
    if (!invoice) return undefined;
    invoice.status = status;
    if (status === 'pagada') invoice.paidAt = new Date();
    return invoice;
  },

  getStats() {
    const all = this.findAll();
    return {
      total: all.length,
      emitidas: all.filter(i => i.status === 'emitida').length,
      pagadas: all.filter(i => i.status === 'pagada').length,
      canceladas: all.filter(i => i.status === 'cancelada').length,
      totalFacturado: all
        .filter(i => i.status !== 'cancelada')
        .reduce((sum, i) => sum + i.total, 0),
    };
  },
};
