import { Request, Response } from "express";
import whatsappService from "../../services/whatsapp.service";

class SessionController {
  async status(req: Request, res: Response) {
    return res.json(whatsappService.status());
  }

  async getQR(req: Request, res: Response) {
    const qr = whatsappService.getQR();

    if (!qr) {
      return res.status(404).json({
        message: "QR não disponível",
        connected: whatsappService.status().connected,
      });
    }

    return res.json({
      qr,
    });
  }

  async disconnect(req: Request, res: Response) {
    await whatsappService.disconnect();

    return res.json({
      message: "Sessão desconectada",
    });
  }

  async restart(req: Request, res: Response) {
    await whatsappService.restart();

    return res.json({
      message: "Sessão reiniciada",
    });
  }
}

export default new SessionController();
