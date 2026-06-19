import { OrderModel } from '../models/Order';
import { InvoiceModel } from '../models/Invoice';
import { DispatchModel } from '../models/Dispatch';
import { ChatMessage } from '../types';

interface IntentResult {
  action: string;
  response: string;
}

const greetings = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal', 'buen dia'];
const farewells = ['adios', 'bye', 'hasta luego', 'nos vemos', 'chao', 'salir', 'terminar'];

function detectIntent(msg: string, lastAction?: string): IntentResult | null {
  const m = msg.toLowerCase();

  if (greetings.some(g => m.includes(g))) {
    return {
      action: 'greeting',
      response: '¡Hola! Soy el asistente de FlowPedidos. Puedo mostrarte estadísticas, explicarte el flujo de automatización, ayudarte a crear pedidos o consultar facturas y despachos. ¿Qué necesitas?',
    };
  }

  if (farewells.some(f => m.includes(f))) {
    return {
      action: 'farewell',
      response: '¡Hasta luego! Si necesitas algo más, aquí estoy.',
    };
  }

  if (m.includes('gracias') || m.includes('perfecto') || m.includes('excelente')) {
    return {
      action: 'thanks',
      response: '¡De nada! ¿Hay algo más en lo que pueda ayudarte?',
    };
  }

  if (m.includes('si') || m.includes('simular') || m.includes('prueba') || (lastAction === 'create_order' && (m.includes('si') || m.includes('ok') || m.includes('adelante')))) {
    const orders = OrderModel.findAll();
    const lastOrder = orders.length > 0 ? orders[orders.length - 1] : null;
    return {
      action: 'simulate',
      response: lastOrder
        ? `Último pedido: *${lastOrder.clientName}* por *$${lastOrder.total.toLocaleString()}* - Estado: *${lastOrder.status}*.\n\n¿Quieres que avance el estado del pedido o ver sus facturas?`
        : 'No hay pedidos registrados. Crea uno desde la sección Pedidos.',
    };
  }

  if (m.includes('estad') || m.includes('reporte') || m.includes('dashboard') || m.includes('resumen')) {
    const orderStats = OrderModel.getStats();
    const invoiceStats = InvoiceModel.getStats();
    const dispatchStats = DispatchModel.getStats();
    return {
      action: 'stats',
      response: `RESUMEN DEL SISTEMA\n\nPedidos: ${orderStats.total} total | ${orderStats.pendiente} pendientes | ${orderStats.facturado} facturados | ${orderStats.despachado} despachados | ${orderStats.entregado} entregados\nFacturas: ${invoiceStats.total} total | $${invoiceStats.totalFacturado.toLocaleString()} facturado\nDespachos: ${dispatchStats.total} total | ${dispatchStats.enTransito} en tránsito | ${dispatchStats.entregado} entregados`,
    };
  }

  if ((m.includes('pedido') || m.includes('orden')) && (m.includes('crear') || m.includes('nuevo') || m.includes('hacer'))) {
    return {
      action: 'create_order',
      response: 'Para crear un pedido ve a la sección *Pedidos* y llena el formulario, o haz clic en *Simular* para generar uno automáticamente. ¿Qué prefieres?',
    };
  }

  if (m.includes('flujo') || m.includes('automatiz') || m.includes('proceso') || m.includes('funciona')) {
    return {
      action: 'explain_flow',
      response: `FLUJO DE AUTOMATIZACION\n\nEl sistema automatiza: Pedido > Factura > Despacho\n\n1. *Pedido* se crea > pasa a "pendiente"\n2. Al avanzar a *"facturado"* > se genera Factura automáticamente\n3. Al avanzar a *"despachado"* > se genera Despacho automáticamente\n4. *Cero errores manuales* - todo el flujo es automático`,
    };
  }

  if (m.includes('cuantos') || m.includes('hay') || m.includes('lista') || m.includes('todos')) {
    const orders = OrderModel.findAll();
    const invoices = InvoiceModel.findAll();
    const dispatches = DispatchModel.findAll();
    return {
      action: 'counts',
      response: `Datos actuales:\n*Pedidos:* ${orders.length} registrados\n*Facturas:* ${invoices.length} emitidas\n*Despachos:* ${dispatches.length} creados`,
    };
  }

  if (m.includes('ayuda') || m.includes('tutorial') || m.includes('que puedes') || m.includes('comandos') || m.includes('opciones')) {
    return {
      action: 'help',
      response: `COMANDOS DISPONIBLES\n\n"estadisticas" - Ver resumen del sistema\n"crear pedido" - Ayuda para crear pedidos\n"flujo" - Explicar automatizacion\n"cuantos hay" - Total de registros\n"factura" - Consultar facturas\n"despacho" - Rastrear despachos\n"simular" - Generar pedido de prueba\n"gracias" - Agradecer\n"adios" - Salir`,
    };
  }

  if (m.includes('factura')) {
    return {
      action: 'find_invoice',
      response: 'Puedes ver todas las facturas en la sección *Facturas*. Cada factura se genera automáticamente cuando un pedido llega al estado "facturado".',
    };
  }

  if (m.includes('despacho') || m.includes('envio') || m.includes('rastreo') || m.includes('track')) {
    return {
      action: 'track_dispatch',
      response: 'Los despachos se crean automáticamente al avanzar un pedido a "despachado". Ve a la sección *Despachos* para ver el estado y número de rastreo.',
    };
  }

  return null;
}

const conversationHistory: Map<string, ChatMessage[]> = new Map();
const lastActions: Map<string, string> = new Map();

export const AIService = {
  processMessage(sessionId: string, message: string): { reply: string; suggestions: string[] } {
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }

    const history = conversationHistory.get(sessionId)!;
    history.push({ role: 'user', content: message, timestamp: new Date() });

    const lastAction = lastActions.get(sessionId);
    const intent = detectIntent(message, lastAction);

    let reply: string;
    let suggestions: string[];

    if (intent) {
      reply = intent.response;
      lastActions.set(sessionId, intent.action);

      const sugMap: Record<string, string[]> = {
        stats: ['Ver flujo', 'Crear pedido', 'Ver facturas', 'Ayuda'],
        create_order: ['Simular pedido', 'Ver flujo', 'Estadísticas', 'Ayuda'],
        explain_flow: ['Ver estadísticas', 'Crear pedido', 'Simular pedido', 'Ayuda'],
        help: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Simular pedido'],
        simulate: ['Avanzar pedido', 'Ver estadísticas', 'Ver flujo', 'Ayuda'],
        find_invoice: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        track_dispatch: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        greeting: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        farewell: ['Ver estadísticas', 'Ver flujo', 'Ayuda'],
        thanks: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        counts: ['Ver estadísticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
      };
      suggestions = sugMap[intent.action] || ['Ver estadísticas', 'Explicar flujo', 'Crear pedido', 'Ayuda'];
    } else {
      reply = 'No entendí tu mensaje. Puedes preguntarme por *estadísticas*, el *flujo de automatización*, o cómo *crear pedidos*. ¿En qué te ayudo?';
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
    lastActions.delete(sessionId);
  },
};


function analyzeSentiment(message: string): string {
  const positiveWords = ['gracias', 'excelente', 'bueno', 'genial', 'perfecto'];
  const negativeWords = ['malo', 'pesimo', 'error', 'problema', 'queja'];
  for (const w of positiveWords) { if (message.includes(w)) return 'positivo'; }
  for (const w of negativeWords) { if (message.includes(w)) return 'negativo'; }
  return 'neutral';
}
