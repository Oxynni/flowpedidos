import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '../services/aiService';
import { InvoiceModel } from '../models/Invoice';

export const ChatController = {
  sendMessage(req: Request, res: Response) {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'El mensaje es requerido' });
    }

    const sid = sessionId || uuidv4();
    const result = AIService.processMessage(sid, message.trim());

    return res.json({
      success: true,
      data: {
        reply: result.reply,
        sessionId: sid,
        suggestions: result.suggestions,
        action: result.action,
        actionData: result.actionData,
      },
    });
  },

  getHistory(req: Request, res: Response) {
    const { sessionId } = req.params;
    const history = AIService.getHistory(sessionId);
    return res.json({ success: true, data: history });
  },

  clearHistory(req: Request, res: Response) {
    const { sessionId } = req.params;
    AIService.clearHistory(sessionId);
    return res.json({ success: true, message: 'Historial limpiado' });
  },

  downloadInvoicePDF(req: Request, res: Response) {
    const { id } = req.params;
    const invoice = InvoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    }

    const order = InvoiceModel.findByOrderId(invoice.orderId);
    const items = invoice.items;

    const lines: string[] = [
      '═══════════════════════════════════════════',
      '           FLOWPEDIDOS - FACTURA',
      '═══════════════════════════════════════════',
      '',
      `Folio: ${invoice.invoiceNumber}`,
      `Fecha: ${new Date(invoice.issuedAt).toLocaleDateString()}`,
      `Estado: ${invoice.status}`,
      '',
      '───────────────────────────────────────────',
      'DATOS DEL CLIENTE',
      '───────────────────────────────────────────',
      `Nombre: ${invoice.clientName}`,
      `Email: ${invoice.clientEmail}`,
      '',
      '───────────────────────────────────────────',
      'PRODUCTOS',
      '───────────────────────────────────────────',
    ];

    items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.productName}`);
      lines.push(`   Cant: ${item.quantity} x $${item.unitPrice.toLocaleString()} = $${item.subtotal.toLocaleString()}`);
    });

    lines.push('');
    lines.push('───────────────────────────────────────────');
    lines.push(`Subtotal: $${invoice.subtotal.toLocaleString()}`);
    lines.push(`IVA (16%): $${invoice.tax.toLocaleString()}`);
    lines.push(`TOTAL: $${invoice.total.toLocaleString()}`);
    lines.push('───────────────────────────────────────────');
    lines.push('');
    lines.push(`Pedido: ${invoice.orderId.slice(0, 8)}...`);
    if (invoice.paidAt) {
      lines.push(`Pagada: ${new Date(invoice.paidAt).toLocaleString()}`);
    }
    lines.push('');
    lines.push('═══════════════════════════════════════════');
    lines.push('       Gracias por su preferencia');
    lines.push('═══════════════════════════════════════════');

    const content = lines.join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Factura_${invoice.invoiceNumber}.txt"`);
    return res.send(content);
  },
};
