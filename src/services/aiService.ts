import { OrderModel } from '../models/Order';
import { InvoiceModel } from '../models/Invoice';
import { DispatchModel } from '../models/Dispatch';
import { ChatMessage, Order, OrderItem } from '../types';

const knownClients = [
  'maximiliano manzano', 'sofia ramirez', 'diego hernandez', 'valentina lopez',
  'alejandro garcia', 'regina torres', 'emiliano flores', 'camila ortiz',
  'sebastian castro', 'ximena vargas', 'mateo rios', 'isabella mendoza',
  'juan perez', 'maria garcia', 'carlos lopez', 'ana martinez', 'pedro sanchez',
];

const knownProducts = [
  { id: 'PROD-001', name: 'laptop hp probook', price: 15500 },
  { id: 'PROD-002', name: 'monitor samsung 24', price: 4200 },
  { id: 'PROD-003', name: 'teclado mecanico logitech', price: 1200 },
  { id: 'PROD-004', name: 'mouse inalambrico mx master', price: 1800 },
  { id: 'PROD-005', name: 'webcam hd 1080p', price: 950 },
  { id: 'PROD-006', name: 'audifonos sony wh-1000xm5', price: 3500 },
  { id: 'PROD-007', name: 'hub usb-c 7 en 1', price: 650 },
  { id: 'PROD-008', name: 'ssd samsung 1tb externo', price: 2200 },
  { id: 'PROD-009', name: 'teclado', price: 500 },
  { id: 'PROD-010', name: 'mouse', price: 300 },
  { id: 'PROD-011', name: 'monitor', price: 3500 },
  { id: 'PROD-012', name: 'laptop', price: 12000 },
];

interface IntentResult {
  action: string;
  response: string;
  data?: any;
}

function findClient(text: string): string | null {
  const lower = text.toLowerCase();
  for (const c of knownClients) {
    if (lower.includes(c)) return c;
  }
  for (const c of knownClients) {
    const parts = c.split(' ');
    if (parts.length >= 2 && lower.includes(parts[0]) && lower.includes(parts[1])) return c;
  }
  return null;
}

function findOrderByClient(clientName: string): Order | undefined {
  const normalized = clientName.toLowerCase().trim();
  return OrderModel.findAll().find(
    o => o.clientName.toLowerCase().includes(normalized)
  );
}

function findAllOrdersByClient(clientName: string): Order[] {
  const normalized = clientName.toLowerCase().trim();
  return OrderModel.findAll().filter(
    o => o.clientName.toLowerCase().includes(normalized)
  );
}

function formatOrderItem(item: OrderItem): string {
  return `  - ${item.productName} x${item.quantity} = $${item.subtotal.toLocaleString()}`;
}

function formatOrder(order: Order): string {
  return [
    `ID: ${order.id.slice(0, 8)}...`,
    `Cliente: ${order.clientName}`,
    `Estado: ${order.status.replace(/_/g, ' ')}`,
    `Total: $${order.total.toLocaleString()}`,
    `Pago: ${order.paymentMethod}`,
    `Productos:`,
    ...order.items.map(formatOrderItem),
    `Creado: ${new Date(order.createdAt).toLocaleString()}`,
  ].join('\n');
}

const greetings = ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'que tal', 'buen dia'];
const farewells = ['adios', 'bye', 'hasta luego', 'nos vemos', 'chao', 'salir', 'terminar'];

function detectIntent(msg: string, lastAction?: string, pendingData?: any): IntentResult | null {
  const m = msg.toLowerCase().trim();

  if (greetings.some(g => m.includes(g))) {
    return {
      action: 'greeting',
      response: [
        '¡Hola! Soy el asistente IA de FlowPedidos. Puedo ayudarte a:',
        '',
        '📦 **Crear pedidos** — Dime "crea un pedido" y te pediré los datos',
        '📋 **Ver pedidos** — "muestra los pedidos" o dime un cliente',
        '📄 **Generar facturas** — "haz la factura" y te pediré el cliente',
        '📤 **Crear despachos** — "crea el despacho" y te pediré los datos',
        '⚡ **Avanzar flujo** — "avanza el pedido" y dime el cliente',
        '📊 **Estadísticas** — "ver estadísticas"',
        '🔄 **Flujo completo** — "haz todo el proceso" y dime el cliente',
        '',
        '¿Qué necesitas?',
      ].join('\n'),
    };
  }

  if (farewells.some(f => m.includes(f))) {
    return { action: 'farewell', response: '¡Hasta luego! Si necesitas algo más, aquí estoy.' };
  }

  if (m.includes('gracias') || m.includes('perfecto') || m.includes('excelente')) {
    return { action: 'thanks', response: '¡De nada! ¿Hay algo más en lo que pueda ayudarte?' };
  }

  if (m.includes('ayuda') || m.includes('tutorial') || m.includes('que puedes') || m.includes('comandos') || m.includes('opciones')) {
    return {
      action: 'help',
      response: [
        'COMANDOS DISPONIBLES',
        '',
        '📦 **Pedidos:**',
        '  "crea un pedido para [cliente]" — Inicia creación guiada',
        '  "muestrame los pedidos" — Lista todos los pedidos',
        '  "pedido de [cliente]" — Muestra detalle del pedido',
        '',
        '📄 **Facturas:**',
        '  "haz la factura de [cliente]" — Genera factura automáticamente',
        '  "factura de [cliente]" — Muestra la factura existente',
        '  "descarga factura de [cliente]" — Genera PDF descargable',
        '',
        '📤 **Despachos:**',
        '  "crea el despacho de [cliente]" — Crea despacho automáticamente',
        '  "despacho de [cliente]" — Muestra el despacho',
        '',
        '⚡ **Flujo:**',
        '  "avanza el pedido de [cliente]" — Siguiente estado',
        '  "haz todo el proceso a [cliente]" — Completa Pedido→Factura→Despacho',
        '',
        '📊 **Sistema:**',
        '  "estadisticas" — Resumen general',
        '  "cuantos hay" — Totales del sistema',
      ].join('\n'),
    };
  }

  if (m.includes('estad') || m.includes('reporte') || m.includes('dashboard') || m.includes('resumen')) {
    const orderStats = OrderModel.getStats();
    const invoiceStats = InvoiceModel.getStats();
    const dispatchStats = DispatchModel.getStats();
    return {
      action: 'stats',
      response: [
        '📊 **RESUMEN DEL SISTEMA**',
        '',
        `**Pedidos:** ${orderStats.total} total`,
        `  ├ Pendientes: ${orderStats.pendiente}`,
        `  ├ Facturados: ${orderStats.facturado}`,
        `  ├ Despachados: ${orderStats.despachado}`,
        `  ├ Entregados: ${orderStats.entregado}`,
        `  └ Cancelados: ${orderStats.cancelado}`,
        '',
        `**Facturas:** ${invoiceStats.total} total | $${(invoiceStats.totalFacturado || 0).toLocaleString()} facturado`,
        `**Despachos:** ${dispatchStats.total} total | ${dispatchStats.enTransito || 0} en tránsito | ${dispatchStats.entregado || 0} entregados`,
        `**Ingresos:** $${(orderStats.ingresos || 0).toLocaleString()}`,
      ].join('\n'),
    };
  }

  if (m.includes('cuantos') || (m.includes('hay') && !m.includes('pedido') && !m.includes('factura') && !m.includes('despacho'))) {
    const orders = OrderModel.findAll();
    const invoices = InvoiceModel.findAll();
    const dispatches = DispatchModel.findAll();
    return {
      action: 'counts',
      response: [
        '📋 **Datos actuales del sistema:**',
        '',
        `  Pedidos: ${orders.length} registrados`,
        `  Facturas: ${invoices.length} emitidas`,
        `  Despachos: ${dispatches.length} creados`,
      ].join('\n'),
    };
  }

  // ─── FULL PROCESS (haz todo el proceso a [cliente]) ───
  if ((m.includes('todo') || m.includes('completo') || m.includes('proceso completo')) && (m.includes('proceso') || m.includes('flujo'))) {
    const client = findClient(m);
    if (!client) {
      return {
        action: 'full_flow_prompt',
        response: '¿A qué cliente quieres aplicarle el flujo completo? Dime el nombre del cliente.',
      };
    }

    const orders = findAllOrdersByClient(client);
    if (orders.length === 0) {
      return { action: 'no_order_for_flow', response: `${client} no tiene pedidos. Crea uno primero.` };
    }

    const order = orders[0];
    if (order.status === 'entregado') {
      return { action: 'already_complete', response: `🎉 El pedido de ${client} ya completó todo el flujo (estado: entregado).` };
    }

    const steps: string[] = [];
    let currentOrder = OrderModel.findById(order.id)!;
    let lastResult: any = null;

    while (currentOrder.status !== 'entregado' && currentOrder.status !== 'cancelado') {
      const result = OrderServiceAdvance(currentOrder.id);
      if (!result) break;
      lastResult = result;
      currentOrder = result.order;
      const step = `  → ${currentOrder.status.replace(/_/g, ' ')}`;
      const extras: string[] = [];
      if (result.autoProcessed?.invoice) extras.push(`📄 Factura ${result.autoProcessed.invoice.invoiceNumber}`);
      if (result.autoProcessed?.dispatch) extras.push(`📤 Despacho ${result.autoProcessed.dispatch.trackingNumber}`);
      steps.push(extras.length > 0 ? `${step} (${extras.join(', ')})` : step);
    }

    return {
      action: 'full_flow_done',
      response: [
        `✅ **Flujo completado para ${client}**`,
        '',
        '**Estados recorridos:**',
        ...steps,
        '',
        '🎉 **Proceso finalizado exitosamente.**',
        '',
        `📥 Puedes descargar la factura: "Descarga la factura de ${client}"`,
      ].join('\n'),
      data: lastResult,
    };
  }

  if (m.includes('flujo') || m.includes('automatiz') || m.includes('como funciona') || m.includes('explica')) {
    return {
      action: 'explain_flow',
      response: [
        '🔄 **FLUJO DE AUTOMATIZACIÓN**',
        '',
        'El sistema automatiza: **Pedido → Factura → Despacho**',
        '',
        '1️⃣ **Pedido** se crea → estado "pendiente"',
        '2️⃣ Al avanzar a **"facturado"** → se genera FACTURA automáticamente',
        '3️⃣ Al avanzar a **"despachado"** → se genera DESPACHO automáticamente',
        '',
        '✨ **Todo automático — cero errores manuales**',
        '',
        'Puedes pedirme que haga todo el proceso por ti:',
        '  "haz todo el proceso a [nombre del cliente]"',
      ].join('\n'),
    };
  }

  const clientName = findClient(m);
  if (clientName && !m.includes('crear') && !m.includes('crea') && !m.includes('nuevo') && (m.includes('pedido') || m.includes('orden') || m.includes('muestra') || m.includes('ver') || m.includes('detalle'))) {
    const orders = findAllOrdersByClient(clientName);
    if (orders.length > 0) {
      const order = orders[0];
      return {
        action: 'show_order',
        response: [
          `📦 **Pedido de ${order.clientName}**`,
          '',
          formatOrder(order),
          '',
          '¿Qué quieres hacer con este pedido?',
          '  "Avanza este pedido" — Siguiente estado',
          '  "Haz la factura" — Generar factura',
          '  "Cancela este pedido" — Cancelar',
        ].join('\n'),
        data: { order },
      };
    } else {
      return {
        action: 'no_order_found',
        response: `No encontré pedidos para "${clientName}". El nombre correcto es "${knownClients.find(k => k.includes(clientName.split(' ')[0])) || clientName}". ¿Quieres crear uno?`,
      };
    }
  }

  // ─── SHOW ALL ORDERS ───
  if ((m.includes('muestra') || m.includes('lista') || m.includes('todos') || m.includes('ver')) && m.includes('pedido')) {
    const orders = OrderModel.findAll();
    if (orders.length === 0) {
      return { action: 'show_orders', response: 'No hay pedidos registrados. Puedes crear uno con "crea un pedido para [cliente]".' };
    }
    const summary = orders.slice(0, 15).map(o =>
      `  ${o.id.slice(0, 8)}... | ${o.clientName} | $${o.total.toLocaleString()} | ${o.status.replace(/_/g, ' ')}`
    ).join('\n');
    return {
      action: 'show_orders',
      response: `📦 **Pedidos (${orders.length} totales)**\n\n${summary}\n\n${orders.length > 15 ? `... y ${orders.length - 15} más` : ''}\n\n¿Quieres ver detalle de algún pedido?`,
      data: { orders: orders.slice(0, 15) },
    };
  }

  // ─── CREATE ORDER ───
  if (m.includes('crear') || m.includes('nuevo') || m.includes('crea') || (m.includes('pedido') && m.includes('para'))) {
    const client = findClient(m);
    if (!client) {
      return {
        action: 'create_order_prompt',
        response: [
          'Para crear un pedido necesito:',
          '1️⃣ **Nombre del cliente**',
          '2️⃣ **Productos** con cantidades (ej: 2 laptops, 1 monitor)',
          '',
          'Dime el nombre del cliente para empezar.',
        ].join('\n'),
      };
    }

    const existingOrders = findAllOrdersByClient(client);
    if (existingOrders.length > 0) {
      return {
        action: 'client_exists',
        response: [
          `${client} ya tiene ${existingOrders.length} pedido(s):`,
          existingOrders.slice(0, 3).map(o =>
            `  ${o.id.slice(0, 8)}... | $${o.total.toLocaleString()} | ${o.status.replace(/_/g, ' ')}`
          ).join('\n'),
          '',
          '¿Quieres crear otro pedido para este cliente o avanzar el existente?',
        ].join('\n'),
        data: { orders: existingOrders },
      };
    }

    const matchedProducts = knownProducts.filter(p =>
      m.includes(p.name) || m.includes(p.name.split(' ')[0])
    );

    if (matchedProducts.length > 0) {
      const items = matchedProducts.map(p => {
        const qtyMatch = m.match(new RegExp(`(\\d+)\\s*${p.name.split(' ')[0]}`));
        const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        return { productId: p.id, productName: p.name.replace(/\b\w/g, c => c.toUpperCase()), quantity: qty, unitPrice: p.price, subtotal: 0 };
      });

      const order = OrderModel.create({
        clientName: client.replace(/\b\w/g, c => c.toUpperCase()),
        clientEmail: `${client.replace(/\s/g, '').toLowerCase()}@email.com`,
        clientPhone: '5512345678',
        items,
        paymentMethod: 'tarjeta',
        notes: 'Pedido creado desde el chatbot',
      });

      return {
        action: 'order_created',
        response: [
          `✅ **Pedido creado exitosamente para ${order.clientName}**`,
          '',
          formatOrder(order),
          '',
          '¿Qué deseas hacer ahora?',
          '  "Avanza este pedido" — Ir al siguiente estado',
          '  "Haz la factura" — Generar factura directamente',
          '  "Ver todos los pedidos" — Lista completa',
        ].join('\n'),
        data: { order },
      };
    }

    return {
      action: 'create_order_no_products',
      response: [
        `Crearé un pedido para **${client}**.`,
        '',
        '¿Qué productos quiere? Ejemplo:',
        `  "2 laptops, 1 monitor, 3 teclados"`,
        '',
        'Productos disponibles: Laptop, Monitor, Teclado, Mouse, Webcam, Audífonos, Hub USB, SSD',
      ].join('\n'),
    };
  }

  // ─── CREATE INVOICE (haz la factura de [cliente]) ───
  if ((m.includes('factura') || m.includes('facturar')) && (m.includes('haz') || m.includes('crea') || m.includes('genera') || m.includes('hacer'))) {
    const client = findClient(m);
    if (!client) {
      return {
        action: 'invoice_prompt',
        response: '¿De qué cliente quieres hacer la factura? Dime el nombre del cliente.',
      };
    }

    const orders = findAllOrdersByClient(client);
    if (orders.length === 0) {
      return {
        action: 'no_order_for_invoice',
        response: `No encontré pedidos para "${client}". Primero crea un pedido para este cliente.`,
      };
    }

    const order = orders[0];
    const existingInvoice = InvoiceModel.findByOrderId(order.id);
    if (existingInvoice) {
      return {
        action: 'invoice_exists',
        response: [
          `⚠️ ${order.clientName} ya tiene una factura:`,
          `  Folio: ${existingInvoice.invoiceNumber}`,
          `  Total: $${existingInvoice.total.toLocaleString()}`,
          `  Estado: ${existingInvoice.status}`,
          '',
          'Puedes descargarla: "Descarga la factura"',
        ].join('\n'),
        data: { invoice: existingInvoice },
      };
    }

    const neededStatuses: string[] = [];
    let currentOrder = { ...order };
    let lastResult: any = null;

    const flow: Record<string, string> = {
      pendiente: 'confirmado',
      confirmado: 'en_facturacion',
      en_facturacion: 'facturado',
    };

    let status = currentOrder.status;
    while (status !== 'facturado' && status !== 'entregado' && status !== 'despachado') {
      const result = OrderServiceAdvance(currentOrder.id);
      if (!result) break;
      lastResult = result;
      status = result.order.status;
      neededStatuses.push(status);
    }

    if (!lastResult || !lastResult.order) {
      return { action: 'invoice_error', response: `No se pudo procesar la factura para ${client}. El pedido está en estado "${currentOrder.status}".` };
    }

    const invoice = InvoiceModel.findByOrderId(currentOrder.id);
    if (!invoice) {
      return { action: 'invoice_error', response: `No se pudo generar la factura automáticamente. Intenta con "avanza el pedido de ${client}" paso a paso.` };
    }

    return {
      action: 'invoice_created',
      response: [
        `✅ **Factura generada exitosamente**`,
        '',
        `Cliente: ${invoice.clientName}`,
        `Folio: ${invoice.invoiceNumber}`,
        `Subtotal: $${invoice.subtotal.toLocaleString()}`,
        `IVA (16%): $${invoice.tax.toLocaleString()}`,
        `**Total: $${invoice.total.toLocaleString()}**`,
        `Estado: ${invoice.status}`,
        ...(neededStatuses.length > 0 ? [`','. ''Estados avanzados automáticamente: ${neededStatuses.join(' → ')}`] : []),
        '',
        '📥 Para descargar: "Descarga la factura de ' + client + '"',
        '',
        '¿Qué más necesitas?',
      ].join('\n'),
      data: { invoice },
    };
  }

  // ─── SHOW INVOICE ───
  if (m.includes('factura') && !m.includes('haz') && !m.includes('crea') && !m.includes('genera') && !m.includes('descarga')) {
    const client = findClient(m);
    if (client) {
      const orders = findAllOrdersByClient(client);
      if (orders.length > 0) {
        const inv = InvoiceModel.findByOrderId(orders[0].id);
        if (inv) {
          return {
            action: 'show_invoice',
            response: [
              `📄 **Factura ${inv.invoiceNumber}**`,
              '',
              `Cliente: ${inv.clientName}`,
              `Subtotal: $${inv.subtotal.toLocaleString()}`,
              `IVA (16%): $${inv.tax.toLocaleString()}`,
              `**Total: $${inv.total.toLocaleString()}**`,
              `Estado: ${inv.status}`,
              `Emitida: ${new Date(inv.issuedAt).toLocaleString()}`,
              ...(inv.paidAt ? [`Pagada: ${new Date(inv.paidAt).toLocaleString()}`] : []),
              '',
              '📥 Descargar: "Descarga esta factura como PDF"',
            ].join('\n'),
            data: { invoice: inv },
          };
        } else {
          return {
            action: 'no_invoice',
            response: `${client} no tiene factura aún. ¿Quieres que la genere?`,
          };
        }
      }
    }
    const invoices = InvoiceModel.findAll();
    if (invoices.length === 0) {
      return { action: 'no_invoices', response: 'No hay facturas aún. Avanza un pedido a "facturado" para generar una automáticamente.' };
    }
    const summary = invoices.slice(0, 10).map(i =>
      `  ${i.invoiceNumber} | ${i.clientName} | $${i.total.toLocaleString()} | ${i.status}`
    ).join('\n');
    return {
      action: 'show_invoices',
      response: `📄 **Facturas (${invoices.length} totales)**\n\n${summary}\n\nPara ver detalle: "factura de [cliente]"`,
      data: { invoices: invoices.slice(0, 10) },
    };
  }

  // ─── DOWNLOAD INVOICE ───
  if ((m.includes('descarga') || m.includes('pdf') || m.includes('descargar')) && m.includes('factura')) {
    const client = findClient(m);
    if (client) {
      const orders = findAllOrdersByClient(client);
      if (orders.length > 0) {
        const inv = InvoiceModel.findByOrderId(orders[0].id);
        if (inv) {
          return {
            action: 'download_invoice',
            response: `📥 **Descarga lista:** [Click aquí para descargar Factura ${inv.invoiceNumber} PDF](/api/chat/invoice/${inv.id}/pdf)`,
            data: { invoice: inv, downloadUrl: `/api/chat/invoice/${inv.id}/pdf` },
          };
        }
      }
    }
    return {
      action: 'download_prompt',
        response: '¿De qué cliente quieres descargar la factura? Dime el nombre del cliente.',
    };
  }

  // ─── CREATE DISPATCH ───
  if ((m.includes('despacho') || m.includes('envio')) && (m.includes('crea') || m.includes('haz') || m.includes('genera'))) {
    const client = findClient(m);
    if (!client) {
      return {
        action: 'dispatch_prompt',
        response: '¿De qué cliente quieres crear el despacho? Dime el nombre del cliente.',
      };
    }

    const orders = findAllOrdersByClient(client);
    if (orders.length === 0) {
      return { action: 'no_order_for_dispatch', response: `${client} no tiene pedidos. Crea uno primero.` };
    }

    const order = orders[0];
    const invoice = InvoiceModel.findByOrderId(order.id);
    if (!invoice) {
      return { action: 'no_invoice_for_dispatch', response: `${client} no tiene factura. Primero genera la factura.` };
    }

    const existingDispatch = DispatchModel.findByOrderId(order.id);
    if (existingDispatch) {
      return {
        action: 'dispatch_exists',
        response: `${client} ya tiene un despacho:\n  Rastreo: ${existingDispatch.trackingNumber}\n  Estado: ${existingDispatch.status}\n  Paquetería: ${existingDispatch.carrier}`,
        data: { dispatch: existingDispatch },
      };
    }

    const dispatch = DispatchModel.create({
      orderId: order.id,
      invoiceId: invoice.id,
      clientName: order.clientName,
      address: `${order.clientName} - Dirección registrada`,
      items: order.items,
      carrier: 'Paquetería Express',
    });

    return {
      action: 'dispatch_created',
      response: [
        `✅ **Despacho creado exitosamente**`,
        '',
        `Cliente: ${dispatch.clientName}`,
        `Rastreo: ${dispatch.trackingNumber}`,
        `Paquetería: ${dispatch.carrier}`,
        `Estado: ${dispatch.status.replace(/_/g, ' ')}`,
        `Dirección: ${dispatch.address}`,
        '',
        '¿Quieres avanzar el despacho a "en tránsito"?',
      ].join('\n'),
      data: { dispatch },
    };
  }

  // ─── SHOW DISPATCH ───
  if ((m.includes('despacho') || m.includes('rastreo')) && !m.includes('crea') && !m.includes('haz')) {
    const client = findClient(m);
    if (client) {
      const orders = findAllOrdersByClient(client);
      if (orders.length > 0) {
        const d = DispatchModel.findByOrderId(orders[0].id);
        if (d) {
          return {
            action: 'show_dispatch',
            response: [
              `📤 **Despacho de ${d.clientName}**`,
              '',
              `Rastreo: ${d.trackingNumber}`,
              `Paquetería: ${d.carrier}`,
              `Estado: ${d.status.replace(/_/g, ' ')}`,
              `Dirección: ${d.address}`,
              `Despachado: ${new Date(d.dispatchedAt).toLocaleString()}`,
              ...(d.deliveredAt ? [`Entregado: ${new Date(d.deliveredAt).toLocaleString()}`] : []),
              '',
              d.status === 'preparando' ? '¿Quieres avanzarlo a "en tránsito"?' : '',
              d.status === 'en_transito' ? '¿Quieres marcarlo como "entregado"?' : '',
            ].join('\n'),
            data: { dispatch: d },
          };
        } else {
          return { action: 'no_dispatch', response: `${client} no tiene despacho. Crea uno con "crea el despacho de ${client}".` };
        }
      }
    }
    const dispatches = DispatchModel.findAll();
    if (dispatches.length === 0) {
      return { action: 'no_dispatches', response: 'No hay despachos aún. Avanza un pedido a "despachado" para generar uno.' };
    }
    const summary = dispatches.slice(0, 10).map(d =>
      `  ${d.trackingNumber} | ${d.clientName} | ${d.carrier} | ${d.status.replace(/_/g, ' ')}`
    ).join('\n');
    return {
      action: 'show_dispatches',
      response: `📤 **Despachos (${dispatches.length} totales)**\n\n${summary}`,
      data: { dispatches: dispatches.slice(0, 10) },
    };
  }

  // ─── ADVANCE ORDER ───
  if ((m.includes('avanza') || m.includes('siguiente') || m.includes('adelante')) && (m.includes('pedido') || clientName)) {
    const targetClient = clientName || (pendingData?.clientName?.toLowerCase() ? findClient(m + ' ' + pendingData.clientName) : null);
    const orders = targetClient ? findAllOrdersByClient(targetClient) : OrderModel.findAll();

    if (orders.length === 0) {
      return { action: 'no_order', response: 'No hay pedidos para avanzar. Crea uno primero.' };
    }

    const order = targetClient ? orders[0] : orders[orders.length - 1];
    if (order.status === 'entregado') {
      return { action: 'already_delivered', response: `El pedido de ${order.clientName} ya está **entregado**. No se puede avanzar más.` };
    }
    if (order.status === 'cancelado') {
      return { action: 'cancelled', response: `El pedido de ${order.clientName} está **cancelado**. No se puede avanzar.` };
    }

    const result = OrderServiceAdvance(order.id);
    if (!result) {
      return { action: 'advance_error', response: `No se pudo avanzar el pedido de ${order.clientName} (estado actual: ${order.status.replace(/_/g, ' ')}).` };
    }

    const lines = [
      `✅ **Pedido avanzado: ${order.clientName}**`,
      `Estado anterior: ${order.status.replace(/_/g, ' ')}`,
      `**Nuevo estado: ${result.order.status.replace(/_/g, ' ')}**`,
    ];
    if (result.autoProcessed?.invoice) {
      lines.push(`📄 Factura generada: ${result.autoProcessed.invoice.invoiceNumber} por $${result.autoProcessed.invoice.total.toLocaleString()}`);
    }
    if (result.autoProcessed?.dispatch) {
      lines.push(`📤 Despacho creado: ${result.autoProcessed.dispatch.trackingNumber} con ${result.autoProcessed.dispatch.carrier}`);
    }
    lines.push('', result.order.status === 'entregado' ? '🎉 **Flujo completado.**' : '¿Quieres seguir avanzando?');

    return {
      action: 'order_advanced',
      response: lines.join('\n'),
      data: result,
    };
  }

  // ─── CANCEL ORDER ───
  if (m.includes('cancela') || m.includes('cancelar')) {
    const client = findClient(m);
    if (client) {
      const orders = findAllOrdersByClient(client);
      if (orders.length > 0) {
        const order = orders[0];
        if (order.status === 'entregado' || order.status === 'despachado') {
          return { action: 'cannot_cancel', response: `No se puede cancelar el pedido de ${client} porque ya está "${order.status.replace(/_/g, ' ')}".` };
        }
        if (order.status === 'cancelado') {
          return { action: 'already_cancelled', response: `El pedido de ${client} ya está cancelado.` };
        }
        OrderModel.updateStatus(order.id, 'cancelado');
        const invoice = InvoiceModel.findByOrderId(order.id);
        if (invoice) InvoiceModel.updateStatus(invoice.id, 'cancelada');
        return {
          action: 'order_cancelled',
          response: `✅ Pedido de **${client}** cancelado.${invoice ? ` Factura ${invoice.invoiceNumber} también cancelada.` : ''}`,
        };
      }
    }
    return { action: 'cancel_prompt', response: '¿Qué pedido quieres cancelar? Indica el nombre del cliente.' };
  }

  // ─── SIMULATE ───
  if (m.includes('simular') || m.includes('prueba')) {
    const order = OrderServiceSimulate();
    return {
      action: 'simulate',
      response: [
        `🎲 **Pedido simulado creado**`,
        '',
        formatOrder(order),
        '',
        '¿Quieres avanzarlo? "Avanza este pedido"',
      ].join('\n'),
      data: { order },
    };
  }

  return null;
}

function OrderServiceAdvance(id: string): any {
  const OrderService = require('./orderService').OrderService;
  return OrderService.advanceStatus(id);
}

function OrderServiceSimulate(): any {
  const OrderService = require('./orderService').OrderService;
  return OrderService.simulateOrder();
}

const conversationHistory: Map<string, ChatMessage[]> = new Map();
const lastActions: Map<string, string> = new Map();
const pendingData: Map<string, any> = new Map();

export const AIService = {
  processMessage(sessionId: string, message: string): { reply: string; suggestions: string[]; action?: string; actionData?: any } {
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }

    const history = conversationHistory.get(sessionId)!;
    history.push({ role: 'user', content: message, timestamp: new Date() });

    const lastAction = lastActions.get(sessionId);
    const pending = pendingData.get(sessionId);
    const intent = detectIntent(message, lastAction, pending);

    let reply: string;
    let suggestions: string[];
    let action: string | undefined;
    let actionData: any;

    if (intent) {
      reply = intent.response;
      action = intent.action;
      actionData = intent.data;
      lastActions.set(sessionId, intent.action);

      if (intent.data) {
        pendingData.set(sessionId, intent.data);
      }

      const sugMap: Record<string, string[]> = {
        stats: ['Ver flujo', 'Crear pedido', 'Ver facturas', 'Ayuda'],
        create_order_prompt: ['Crear pedido', 'Ver pedidos', 'Ayuda', 'Cancelar'],
        order_created: ['Avanza este pedido', 'Haz la factura', 'Ver todos los pedidos', 'Estadisticas'],
        show_order: ['Avanza este pedido', 'Haz la factura', 'Estadisticas', 'Ayuda'],
        show_orders: ['Crear pedido', 'Ver estadisticas', 'Ver flujo', 'Ayuda'],
        invoice_created: ['Descarga esta factura', 'Crear despacho', 'Ver facturas', 'Estadisticas'],
        show_invoice: ['Descarga esta factura', 'Crear despacho', 'Estadisticas', 'Ayuda'],
        show_invoices: ['Haz una factura', 'Crear pedido', 'Estadisticas', 'Ayuda'],
        download_invoice: ['Ver facturas', 'Crear despacho', 'Estadisticas', 'Ayuda'],
        dispatch_created: ['Avanzar despacho', 'Ver despachos', 'Estadisticas', 'Ayuda'],
        show_dispatch: ['Avanzar despacho', 'Estadisticas', 'Ver pedidos', 'Ayuda'],
        show_dispatches: ['Crear despacho', 'Ver estadisticas', 'Ver flujo', 'Ayuda'],
        order_advanced: ['Seguir avanzando', 'Ver estadisticas', 'Ver flujo', 'Ayuda'],
        full_flow_done: ['Descarga la factura', 'Ver estadisticas', 'Ver flujo', 'Ayuda'],
        explain_flow: ['Haz todo el proceso', 'Ver estadisticas', 'Crear pedido', 'Ayuda'],
        help: ['Ver estadisticas', 'Ver flujo', 'Crear pedido', 'Simular'],
        simulate: ['Avanza este pedido', 'Ver estadisticas', 'Ver flujo', 'Ayuda'],
        greeting: ['Ver estadisticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        farewell: ['Ver estadisticas', 'Ver flujo', 'Ayuda'],
        thanks: ['Ver estadisticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        counts: ['Ver estadisticas', 'Ver flujo', 'Crear pedido', 'Ayuda'],
        no_order_found: ['Crear pedido', 'Ver todos los pedidos', 'Ayuda'],
        client_exists: ['Crear otro', 'Avanza este pedido', 'Ver todos', 'Ayuda'],
        create_order_no_products: ['2 laptops', '1 monitor y 1 teclado', '3 audifonos', 'Ayuda'],
        invoice_prompt: ['Hacer factura', 'Ver facturas', 'Cancelar', 'Ayuda'],
        invoice_exists: ['Descarga esta factura', 'Crear despacho', 'Ayuda'],
        download_prompt: ['Ver facturas', 'Hacer factura', 'Ayuda', 'Cancelar'],
        dispatch_prompt: ['Crear despacho', 'Ver despachos', 'Ayuda', 'Cancelar'],
        no_invoice: ['Haz la factura', 'Avanza el pedido', 'Ver pedidos', 'Ayuda'],
        full_flow_prompt: ['Hacer todo el proceso', 'Ver pedidos', 'Cancelar', 'Ayuda'],
        no_order_for_flow: ['Crear pedido', 'Ver todos', 'Ayuda'],
        already_complete: ['Ver estadisticas', 'Ver flujo', 'Ayuda'],
        no_order: ['Crear pedido', 'Simular pedido', 'Ver pedidos', 'Ayuda'],
        already_delivered: ['Ver estadisticas', 'Ver flujo', 'Ayuda'],
        advance_error: ['Ver pedidos', 'Ayuda'],
        cannot_cancel: ['Ver pedidos', 'Ayuda'],
        order_cancelled: ['Crear pedido', 'Ver pedidos', 'Estadisticas', 'Ayuda'],
        cancel_prompt: ['Cancelar pedido', 'Ver pedidos', 'Ayuda', 'Estadisticas'],
      };
      suggestions = sugMap[intent.action] || ['Ver estadisticas', 'Explicar flujo', 'Crear pedido', 'Ayuda'];
    } else {
      reply = 'No entendí tu mensaje. Puedes pedirme:\n\n📦 "Crear un pedido" — y te pediré los datos\n📄 "Haz la factura" — y dime el cliente\n📤 "Crea el despacho" — y dime el cliente\n⚡ "Avanza el pedido" — y dime el cliente\n📊 "Ver estadisticas"\n\n¿En qué te ayudo?';
      suggestions = ['Ver estadisticas', 'Explicar flujo', 'Crear pedido', 'Ayuda'];
    }

    history.push({ role: 'assistant', content: reply, timestamp: new Date() });

    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }

    return { reply, suggestions, action, actionData };
  },

  getHistory(sessionId: string): ChatMessage[] {
    return conversationHistory.get(sessionId) || [];
  },

  clearHistory(sessionId: string): void {
    conversationHistory.delete(sessionId);
    lastActions.delete(sessionId);
    pendingData.delete(sessionId);
  },
};
