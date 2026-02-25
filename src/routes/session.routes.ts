import { Router } from 'express';
import { getStatus, getQr, disconnect, restart } from '../controllers/session.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /v1/session/status:
 *   get:
 *     summary: Get session status
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current session status
 */
router.get('/status', getStatus);

/**
 * @swagger
 * /v1/session/qr:
 *   get:
 *     summary: Get QR Code
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Base64 QR Code
 *       404:
 *         description: QR Code not available
 */
router.get('/qr', getQr);

/**
 * @swagger
 * /v1/session/disconnect:
 *   post:
 *     summary: Disconnect session
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session disconnected
 */
router.post('/disconnect', disconnect);

/**
 * @swagger
 * /v1/session/restart:
 *   post:
 *     summary: Restart session
 *     tags: [Session]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restarting connection
 */
router.post('/restart', restart);

export default router;
