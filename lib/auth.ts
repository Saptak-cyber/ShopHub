import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors';

export interface JWTPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function generateToken(payload: JWTPayload): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid token');
  }
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(request: Request): JWTPayload {
  const user = getUserFromRequest(request);

  if (!user) {
    throw new UnauthorizedError('Authentication required');
  }

  return user;
}

export function requireAdmin(request: Request): JWTPayload {
  const user = requireAuth(request);

  if (!user.isAdmin) {
    throw new UnauthorizedError('Admin access required');
  }

  return user;
}
