import { Router } from 'express';
import { DispatchController } from '../controllers/dispatchController';

const router = Router();

router.get('/stats', DispatchController.getStats);
router.get('/', DispatchController.getAll);
router.get('/:id', DispatchController.getById);
router.get('/order/:orderId', DispatchController.getByOrderId);
router.patch('/:id/advance', DispatchController.advanceStatus);
router.patch('/:id/fail', DispatchController.markAsFailed);

export default router;
