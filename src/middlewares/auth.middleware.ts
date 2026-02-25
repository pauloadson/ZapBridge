import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing.' });
  }

  const token = authHeader.split(' ')[1];

  if (token !== config.API_KEY) {
    return res.status(401).json({ error: 'Invalid API Key.' });
  }

  next();
};
