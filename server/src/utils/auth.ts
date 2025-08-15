import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateAccessToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JWTPayload;
};

export const createSession = async (userId: string, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const session = await db.session.create({
    data: {
      token: generateAccessToken(userId, ''), // Will be updated after user lookup
      refreshToken,
      userId,
      expiresAt,
      refreshExpiresAt,
    },
  });
  
  return session;
};

export const deleteSession = async (refreshToken: string) => {
  await db.session.deleteMany({
    where: { refreshToken },
  });
};

export const cleanExpiredSessions = async () => {
  await db.session.deleteMany({
    where: {
      refreshExpiresAt: {
        lt: new Date(),
      },
    },
  });
};