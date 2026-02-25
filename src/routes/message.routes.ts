import { Router } from 'express';
import { send } from '../controllers/message.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /v1/messages/send:
 *   post:
 *     summary: Send a WhatsApp message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - message
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "5511999999999"
 *               message:
 *                 type: string
 *                 example: "Olá, esta é uma mensagem de teste!"
 *               delayTyping:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 15
 *                 example: 5
 *               delayMessage:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 15
 *                 example: 2
 *               editMessageId:
 *                 type: string
 *                 description: ID of message to edit
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/send', authMiddleware, send);

export default router;
