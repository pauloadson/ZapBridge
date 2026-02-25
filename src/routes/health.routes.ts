import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /v1/health:
 *   get:
 *     summary: Health Check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is UP
 */
router.get('/health', healthCheck);

export default router;
