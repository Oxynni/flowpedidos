import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AIService } from '../services/aiService';

export const ChatController = {
  sendMessage(req: Request, res: Response) {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'El mensaje es requerido' });
    }

    const sid = sessionId || uuidv4();
    const result = AIService.processMessage(sid, message.trim());

    return res.json({
      success: true,
      data: {
        reply: result.reply,
        sessionId: sid,
        suggestions: result.suggestions,
      },
    });
  },

  getHistory(req: Request, res: Response) {
    const { sessionId } = req.params;
    const history = AIService.getHistory(sessionId);
    return res.json({ success: true, data: history });
  },

  clearHistory(req: Request, res: Response) {
    const { sessionId } = req.params;
    AIService.clearHistory(sessionId);
    return res.json({ success: true, message: 'Historial limpiado' });
  },
};
