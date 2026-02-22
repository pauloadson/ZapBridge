import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido ou inválido.' });
  }

  const token = authHeader.split(' ')[1];

  if (token === API_KEY) {
    next();
  } else {
    return res.status(403).json({ message: 'Token de autenticação inválido.' });
  }
};