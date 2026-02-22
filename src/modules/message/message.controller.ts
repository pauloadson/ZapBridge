import { Request, Response } from "express";
import whatsappService from "../../services/whatsapp.service";

export const sendMessage = async (req: Request, res: Response) => {
  const { number, message, delayMessage, delayTyping } = req.body;

  if (!number || !message) {
    return res.status(400).json({
      success: false,
      error: "number and message are required",
    });
  }

  try {
    await whatsappService.sendMessage(number, message, {
      delayMessage: delayMessage !== undefined ? Number(delayMessage) : undefined,
      delayTyping: delayTyping !== undefined ? Number(delayTyping) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Erro ao enviar mensagem",
    });
  }
};
