import { Request, Response } from 'express';
import { whatsappService } from '../services/whatsapp.service';

export const getStatus = (req: Request, res: Response) => {
  const status = whatsappService.getStatus();
  res.status(200).json(status);
};

export const getQr = (req: Request, res: Response) => {
  const { qr } = whatsappService.getStatus();
  if (!qr) {
    return res.status(404).json({ error: 'QR Code not available or already connected.' });
  }
  res.status(200).json({ qr });
};

export const disconnect = async (req: Request, res: Response) => {
  await whatsappService.disconnect();
  res.status(200).json({ message: 'Disconnected and session cleared.' });
};

export const restart = async (req: Request, res: Response) => {
  await whatsappService.restart();
  res.status(200).json({ message: 'Restarting connection...' });
};
