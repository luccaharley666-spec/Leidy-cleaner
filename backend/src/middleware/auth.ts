import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { ApiError, AuthRequest } from './errorHandler';

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw ApiError('No token provided', 401);
    }

    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    logger.warn('Authentication failed:', error);
    const err = error as any;
    res.status(err.status || 401).json({
      error: {
        message: err.message || 'Authentication failed',
        status: err.status || 401,
      },
    });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
      });
    }

    return next();
  };
};

export const authenticate = authenticateToken;
