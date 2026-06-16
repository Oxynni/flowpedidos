import { Request, Response } from 'express';
import { OrderService } from '../services/orderService';
import { OrderStatus } from '../types';

export const OrderController = {
  create(req: Request, res: Response) {
    const { clientName, clientEmail, clientPhone, items, paymentMethod, notes } = req.body;

    if (!clientName || !clientEmail || !items || !paymentMethod) {
      return res.status(400).json({ success: false, error: 'Faltan campos requeridos: clientName, clientEmail, items, paymentMethod' });
    }

    const order = OrderService.create({ clientName, clientEmail, clientPhone, items, paymentMethod, notes });
    return res.status(201).json({ success: true, data: order, message: 'Pedido creado exitosamente' });
  },

  getAll(req: Request, res: Response) {
    const { status } = req.query;

    if (status && typeof status === 'string') {
      const orders = OrderService.getByStatus(status as OrderStatus);
      return res.json({ success: true, data: orders });
    }

    const orders = OrderService.getAll();
    return res.json({ success: true, data: orders });
  },

  getById(req: Request, res: Response) {
    const order = OrderService.getById(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    return res.json({ success: true, data: order });
  },

  advanceStatus(req: Request, res: Response) {
    const result = OrderService.advanceStatus(req.params.id);
    if (!result) return res.status(400).json({ success: false, error: 'No se pudo avanzar el estado del pedido' });
    return res.json({ success: true, data: result, message: 'Estado actualizado. Proceso automático ejecutado.' });
  },

  cancel(req: Request, res: Response) {
    const order = OrderService.cancel(req.params.id);
    if (!order) return res.status(400).json({ success: false, error: 'No se pudo cancelar el pedido' });
    return res.json({ success: true, data: order, message: 'Pedido cancelado' });
  },

  delete(req: Request, res: Response) {
    const deleted = OrderService.delete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    return res.json({ success: true, message: 'Pedido eliminado' });
  },

  getStats(req: Request, res: Response) {
    const stats = OrderService.getStats();
    return res.json({ success: true, data: stats });
  },

  simulate(req: Request, res: Response) {
    const order = OrderService.simulateOrder();
    return res.status(201).json({ success: true, data: order, message: 'Pedido simulado creado' });
  },

  seed(req: Request, res: Response) {
    OrderService.seedData();
    const stats = OrderService.getStats();
    return res.json({ success: true, data: stats, message: 'Base de datos sembrada con 12 pedidos' });
  },
};
