import express from 'express';
import cors from 'cors';
import path from 'path';
import orderRoutes from './routes/orders';
import invoiceRoutes from './routes/invoices';
import dispatchRoutes from './routes/dispatches';
import chatRoutes from './routes/chat';
import { errorHandler, requestLogger } from './middleware/errorHandler';
import { OrderService } from './services/orderService';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'online',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        orders: '/api/orders',
        invoices: '/api/invoices',
        dispatches: '/api/dispatches',
        chat: '/api/chat',
      },
    },
  });
});

app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dispatches', dispatchRoutes);
app.use('/api/chat', chatRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  OrderService.seedData();
  const stats = OrderService.getStats();
  console.log(`
  ╔══════════════════════════════════════════╗
  ║        FLOWPEDIDOS - API v1.0.0          ║
  ║  Automatización Pedido-Factura-Despacho  ║
  ╚══════════════════════════════════════════╝
  Servidor corriendo en: http://localhost:${PORT}
  Documentación:      http://localhost:${PORT}/api/health
  Chatbot AI:         POST http://localhost:${PORT}/api/chat/message
  Pedidos:            GET/POST http://localhost:${PORT}/api/orders
  Facturas:           GET     http://localhost:${PORT}/api/invoices
  Despachos:          GET     http://localhost:${PORT}/api/dispatches
  Datos semilla:      ${stats.total} pedidos | ${stats.facturado} facturados | ${stats.despachado} despachados
  `);
});

export default app;
