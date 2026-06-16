import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';

const router = Router();

router.get('/stats', InvoiceController.getStats);
router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.get('/order/:orderId', InvoiceController.getByOrderId);
router.patch('/:id/pay', InvoiceController.pay);
router.patch('/:id/cancel', InvoiceController.cancel);

export default router;
