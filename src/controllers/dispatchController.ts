import { Request, Response } from 'express';
import { DispatchService } from '../services/dispatchService';

export const DispatchController = {
  getAll(req: Request, res: Response) {
    const dispatches = DispatchService.getAll();
    return res.json({ success: true, data: dispatches });
  },

  getById(req: Request, res: Response) {
    const dispatch = DispatchService.getById(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, error: 'Despacho no encontrado' });
    return res.json({ success: true, data: dispatch });
  },

  getByOrderId(req: Request, res: Response) {
    const dispatch = DispatchService.getByOrderId(req.params.orderId);
    if (!dispatch) return res.status(404).json({ success: false, error: 'Despacho no encontrado para este pedido' });
    return res.json({ success: true, data: dispatch });
  },

  advanceStatus(req: Request, res: Response) {
    const dispatch = DispatchService.advanceStatus(req.params.id);
    if (!dispatch) return res.status(400).json({ success: false, error: 'No se pudo avanzar el estado del despacho' });
    return res.json({ success: true, data: dispatch, message: 'Estado de despacho actualizado' });
  },

  markAsFailed(req: Request, res: Response) {
    const dispatch = DispatchService.markAsFailed(req.params.id);
    if (!dispatch) return res.status(404).json({ success: false, error: 'Despacho no encontrado' });
    return res.json({ success: true, data: dispatch, message: 'Despacho marcado como fallido' });
  },

  getStats(req: Request, res: Response) {
    const stats = DispatchService.getStats();
    return res.json({ success: true, data: stats });
  },
};
