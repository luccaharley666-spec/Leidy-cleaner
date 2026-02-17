import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';
import { logger } from './logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

export const generateTokens = (payload: JWTPayload) => {
  try {
    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRE,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Error generating tokens:', error);
    throw new Error('Failed to generate tokens');
  }
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    logger.error('Token verification failed:', error);
    throw new Error('Invalid token');
  }
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    throw new Error('Invalid refresh token');
  }
};

export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};
