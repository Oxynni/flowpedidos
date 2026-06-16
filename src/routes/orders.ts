import { Router } from 'express';
import { OrderController } from '../controllers/orderController';

const router = Router();

router.get('/stats', OrderController.getStats);
router.post('/simulate', OrderController.simulate);
router.post('/seed', OrderController.seed);
router.get('/', OrderController.getAll);
router.post('/', OrderController.create);
router.get('/:id', OrderController.getById);
router.patch('/:id/advance', OrderController.advanceStatus);
router.patch('/:id/cancel', OrderController.cancel);
router.delete('/:id', OrderController.delete);

export default router;
