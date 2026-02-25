import { Router } from 'express';
import healthRoutes from './health.routes';
import sessionRoutes from './session.routes';
import messageRoutes from './message.routes';

const router = Router();

router.use('/v1', healthRoutes);
router.use('/v1/session', sessionRoutes);
router.use('/v1/messages', messageRoutes);

export default router;
