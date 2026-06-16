import { Router } from 'express';
import { ChatController } from '../controllers/chatController';

const router = Router();

router.post('/message', ChatController.sendMessage);
router.get('/history/:sessionId', ChatController.getHistory);
router.delete('/history/:sessionId', ChatController.clearHistory);

export default router;
