import { OrderModel } from '../models/Order';
import { InvoiceModel } from '../models/Invoice';
import { DispatchModel } from '../models/Dispatch';
import { Order, OrderStatus, OrderItem, PaymentMethod } from '../types';

export const OrderService = {
  create(data: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    items: { productId: string; productName: string; quantity: number; unitPrice: number }[];
    paymentMethod: PaymentMethod;
    notes?: string;
  }): Order {
    return OrderModel.create(data);
  },

  getById(id: string): Order | undefined {
    return OrderModel.findById(id);
  },

  getAll(): Order[] {
    return OrderModel.findAll();
  },

  getByStatus(status: OrderStatus): Order[] {
    return OrderModel.findByStatus(status);
  },

  getStats() {
    return OrderModel.getStats();
  },

  advanceStatus(id: string): { order: Order; autoProcessed?: { invoice?: any; dispatch?: any } } | undefined {
    const order = OrderModel.findById(id);
    if (!order) return undefined;

    const flow: Record<OrderStatus, OrderStatus> = {
      pendiente: 'confirmado',
      confirmado: 'en_facturacion',
      en_facturacion: 'facturado',
      facturado: 'en_despacho',
      en_despacho: 'despachado',
      despachado: 'entregado',
      entregado: 'entregado',
      cancelado: 'cancelado',
    };

    const nextStatus = flow[order.status];
    if (!nextStatus || nextStatus === order.status) return undefined;

    const updated = OrderModel.updateStatus(id, nextStatus);
    if (!updated) return undefined;

    const result: any = { order: updated };

    if (nextStatus === 'facturado') {
      const invoice = InvoiceModel.createFromOrder({
        orderId: updated.id,
        clientName: updated.clientName,
        clientEmail: updated.clientEmail,
        items: updated.items,
        total: updated.total,
      });
      result.autoProcessed = { invoice };
    }

    if (nextStatus === 'despachado') {
      const invoice = InvoiceModel.findByOrderId(updated.id);
      if (invoice) {
        const dispatch = DispatchModel.create({
          orderId: updated.id,
          invoiceId: invoice.id,
          clientName: updated.clientName,
          address: `${updated.clientName} - Dirección registrada`,
          items: updated.items,
          carrier: 'Paquetería Express',
        });
        result.autoProcessed = { ...result.autoProcessed, dispatch };
      }
    }

    return result;
  },

  cancel(id: string): Order | undefined {
    const order = OrderModel.findById(id);
    if (!order) return undefined;
    if (order.status === 'entregado' || order.status === 'despachado') return undefined;

    OrderModel.updateStatus(id, 'cancelado');

    const invoice = InvoiceModel.findByOrderId(id);
    if (invoice) InvoiceModel.updateStatus(invoice.id, 'cancelada');

    return OrderModel.findById(id);
  },

  delete(id: string): boolean {
    return OrderModel.delete(id);
  },

  simulateOrder(): Order {
    const products = [
      { productId: 'PROD-001', productName: 'Laptop HP ProBook', unitPrice: 15500 },
      { productId: 'PROD-002', productName: 'Monitor Samsung 24"', unitPrice: 4200 },
      { productId: 'PROD-003', productName: 'Teclado Mecánico Logitech', unitPrice: 1200 },
      { productId: 'PROD-004', productName: 'Mouse Inalámbrico MX Master', unitPrice: 1800 },
      { productId: 'PROD-005', productName: 'Webcam HD 1080p', unitPrice: 950 },
      { productId: 'PROD-006', productName: 'Audífonos Sony WH-1000XM5', unitPrice: 3500 },
    ];

    const names = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez'];
    const payments: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'credito'];

    const selectedProducts = products.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 3));
    const items = selectedProducts.map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: 1 + Math.floor(Math.random() * 3),
      unitPrice: p.unitPrice,
      subtotal: 0,
    }));

    const order = OrderModel.create({
      clientName: names[Math.floor(Math.random() * names.length)],
      clientEmail: `cliente${Math.floor(Math.random() * 100)}@email.com`,
      clientPhone: `55${String(Math.floor(Math.random() * 10000000)).padStart(8, '0')}`,
      items,
      paymentMethod: payments[Math.floor(Math.random() * payments.length)],
      notes: 'Pedido generado automáticamente',
    });

    return order;
  },

  seedData(): void {
    const clients = [
      { name: 'Maximiliano Manzano', email: 'max@email.com', phone: '5512345678', address: 'Av. Universidad 123, Acapulco' },
      { name: 'Sofia Ramirez', email: 'sofia@email.com', phone: '5598765432', address: 'Calle Reforma 456, CDMX' },
      { name: 'Diego Hernandez', email: 'diego@email.com', phone: '5545678901', address: 'Blvd. Costera 789, Acapulco' },
      { name: 'Valentina Lopez', email: 'vale@email.com', phone: '5523456780', address: 'Av. Insurgentes 234, CDMX' },
      { name: 'Alejandro Garcia', email: 'alex@email.com', phone: '5578901234', address: 'Calle Hidalgo 567, Acapulco' },
      { name: 'Regina Torres', email: 'regina@email.com', phone: '5567890123', address: 'Paseo de la Reforma 890, CDMX' },
      { name: 'Emiliano Flores', email: 'emi@email.com', phone: '5534567890', address: 'Av. Principal 345, Acapulco' },
      { name: 'Camila Ortiz', email: 'cami@email.com', phone: '5589012345', address: 'Callejon 678, CDMX' },
      { name: 'Sebastian Castro', email: 'sebas@email.com', phone: '5510987654', address: 'Blvd. de las Naciones 901, Acapulco' },
      { name: 'Ximena Vargas', email: 'xime@email.com', phone: '5576543210', address: 'Av. del Sol 123, CDMX' },
      { name: 'Mateo Rios', email: 'mateo@email.com', phone: '5543210987', address: 'Calle Luna 456, Acapulco' },
      { name: 'Isabella Mendoza', email: 'isa@email.com', phone: '5598765012', address: 'Paseo del Mar 789, CDMX' },
    ];

    const allProducts = [
      { pid: 'PROD-001', pname: 'Laptop HP ProBook 450', price: 15500 },
      { pid: 'PROD-002', pname: 'Monitor Samsung 24" 4K', price: 4200 },
      { pid: 'PROD-003', pname: 'Teclado Mecanico Logitech', price: 1200 },
      { pid: 'PROD-004', pname: 'Mouse Inalambrico MX Master', price: 1800 },
      { pid: 'PROD-005', pname: 'Webcam HD 1080p Logitech', price: 950 },
      { pid: 'PROD-006', pname: 'Audifonos Sony WH-1000XM5', price: 3500 },
      { pid: 'PROD-007', pname: 'Hub USB-C 7 en 1', price: 650 },
      { pid: 'PROD-008', pname: 'SSD Samsung 1TB Externo', price: 2200 },
    ];

    const payments: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia', 'credito'];
    const carriers = ['DHL', 'FedEx', 'Estafeta', 'Paqueteria Express'];

    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const c = clients[i];
      const daysAgo = Math.floor(Math.random() * 14);
      const hrsAgo = Math.floor(Math.random() * 12);
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);
      orderDate.setHours(orderDate.getHours() - hrsAgo);

      const numProducts = 1 + Math.floor(Math.random() * 4);
      const shuffled = [...allProducts].sort(() => Math.random() - 0.5).slice(0, numProducts);
      const items = shuffled.map(p => ({
        productId: p.pid,
        productName: p.pname,
        quantity: 1 + Math.floor(Math.random() * 3),
        unitPrice: p.price,
        subtotal: 0,
      }));

      const order = OrderModel.create({
        clientName: c.name,
        clientEmail: c.email,
        clientPhone: c.phone,
        items,
        paymentMethod: payments[Math.floor(Math.random() * payments.length)],
        notes: `Pedido #${i + 1} - Cliente ${c.name}`,
        createdAt: orderDate,
      });

      const statuses: OrderStatus[] = ['pendiente', 'confirmado', 'en_facturacion', 'facturado', 'en_despacho', 'despachado', 'entregado'];
      const targetIndex = Math.min(i, statuses.length - 1);
      for (let s = 0; s < targetIndex; s++) {
        this.advanceStatus(order.id);
      }
    }
  },
};
