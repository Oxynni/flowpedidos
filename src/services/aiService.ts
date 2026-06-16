import { OrderModel } from '../models/Order';
import { InvoiceModel } from '../models/Invoice';
import { DispatchModel } from '../models/Dispatch';
import { ChatMessage } from '../types';

interface IntentResult {
  action: string;
  response: string;
  data?: any;
}

function detectIntent(message: string): IntentResult | null {
  const msg = message.toLowerCase();

  if (msg.includes('estad') || msg.includes('reporte') || msg.includes('dashboard') || msg.includes('resumen')) {
    const orderStats = OrderModel.getStats();
    const invoiceStats = InvoiceModel.getStats();
    const dispatchStats = DispatchModel.getStats();
    return {
      action: 'stats',
      response: `*RESUMEN DEL SISTEMA*\n\n*Pedidos:* ${orderStats.total} total | ${orderStats.pendiente} pendientes | ${orderStats.facturado} facturados | ${orderStats.despachado} despachados | ${orderStats.entregado} entregados\n*Facturas:* ${invoiceStats.total} total | $${invoiceStats.totalFacturado.toLocaleString()} facturado\n*Despachos:* ${dispatchStats.total} total | ${dispatchStats.enTransito} en tránsito | ${dispatchStats.entregado} entregados`,
      data: { orderStats, invoiceStats, dispatchStats },
    };
  }

  if (msg.includes('pedido') && (msg.includes('crear') || msg.includes('nuevo') || msg.includes('simular'))) {
    return {
      action: 'create_order',
      response: 'Para crear un pedido, usa el endpoint POST /api/orders o haz clic en "Nuevo Pedido". ¿Quieres que simule un pedido de prueba?',
    };
  }

  if (msg.includes('flujo') || msg.includes('automatiz') || msg.includes('proceso')) {
    return {
      action: 'explain_flow',
      response: `*FLUJO DE AUTOMATIZACION*\n\nEl sistema automatiza: Pedido > Factura > Despacho\n\n1. *Pedido* se crea > pasa a "pendiente"\n2. Al avanzar a *"facturado"* > se genera Factura automáticamente\n3. Al avanzar a *"despachado"* > se genera Despacho automáticamente\n4. *Cero errores manuales* - todo el flujo es automático`,
    };
  }

  if (msg.includes('error') || msg.includes('problema') || msg.includes('ayuda') || msg.includes('tutorial')) {
    return {
      action: 'help',
      response: `*ASISTENTE FLOWPEDIDOS*\n\nComandos disponibles:\n- "estadisticas" - Ver resumen del sistema\n- "crear pedido" - Crear nuevo pedido\n- "flujo" - Explicar automatizacion\n- "factura [id]" - Consultar factura\n- "despacho [id]" - Rastrear despacho\n- "ayuda" - Ver este mensaje\n\nEn que mas puedo ayudarte?`,
    };
  }

  if (msg.includes('factura') && (msg.includes('buscar') || msg.includes('consulta'))) {
    return {
      action: 'find_invoice',
      response: 'Para consultar una factura, usa GET /api/invoices/:id o proporciona el numero de factura.',
    };
  }

  if (msg.includes('despacho') && (msg.includes('rastrear') || msg.includes('track') || msg.includes('seguimiento'))) {
    return {
      action: 'track_dispatch',
      response: 'Para rastrear un despacho, usa GET /api/dispatches/:id o proporciona el numero de rastreo.',
    };
  }

  return null;
}

const conversationHistory: Map<string, ChatMessage[]> = new Map();

export const AIService = {
  processMessage(sessionId: string, message: string): { reply: string; suggestions: string[] } {
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }

    const history = conversationHistory.get(sessionId)!;
    history.push({ role: 'user', content: message, timestamp: new Date() });

    const intent = detectIntent(message);

    let reply: string;
    let suggestions: string[];

    if (intent) {
      reply = intent.response;
      suggestions = ['Ver estadísticas', 'Explicar flujo', 'Simular pedido', 'Ayuda'];
    } else {
      reply = `Hola! Soy el asistente AI de FlowPedidos. Puedo ayudarte con:\n\n*Estadisticas* - Resumen del sistema\n*Flujo* - Explicar automatizacion\n*Pedidos* - Gestion de pedidos\n*Facturas* - Consulta de facturas\n*Despachos* - Rastreo de envios\n\nQue deseas hacer?`;
      suggestions = ['Ver estadísticas', 'Explicar flujo', 'Crear pedido', 'Ayuda'];
    }

    history.push({ role: 'assistant', content: reply, timestamp: new Date() });

    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    return { reply, suggestions };
  },

  getHistory(sessionId: string): ChatMessage[] {
    return conversationHistory.get(sessionId) || [];
  },

  clearHistory(sessionId: string): void {
    conversationHistory.delete(sessionId);
  },
};
