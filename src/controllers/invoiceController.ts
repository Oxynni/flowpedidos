import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';

export const InvoiceController = {
  getAll(req: Request, res: Response) {
    const invoices = InvoiceService.getAll();
    return res.json({ success: true, data: invoices });
  },

  getById(req: Request, res: Response) {
    const invoice = InvoiceService.getById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    return res.json({ success: true, data: invoice });
  },

  getByOrderId(req: Request, res: Response) {
    const invoice = InvoiceService.getByOrderId(req.params.orderId);
    if (!invoice) return res.status(404).json({ success: false, error: 'Factura no encontrada para este pedido' });
    return res.json({ success: true, data: invoice });
  },

  pay(req: Request, res: Response) {
    const invoice = InvoiceService.pay(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    return res.json({ success: true, data: invoice, message: 'Factura marcada como pagada' });
  },

  cancel(req: Request, res: Response) {
    const invoice = InvoiceService.cancel(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    return res.json({ success: true, data: invoice, message: 'Factura cancelada' });
  },

  getStats(req: Request, res: Response) {
    const stats = InvoiceService.getStats();
    return res.json({ success: true, data: stats });
  },
};
