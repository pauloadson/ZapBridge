import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';

export const send = async (req: Request, res: Response) => {
  const { phone, message, delayTyping, delayMessage, editMessageId } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required.' });
  }

  try {
    const result = await whatsappService.sendMessage(phone, message, {
      delayTyping,
      delayMessage,
      editMessageId
    });
    res.status(200).json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
