// Authentication utilities for token validation

import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined');
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as TokenPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired');
      return null;
    }
    if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token');
      return null;
    }
    console.error('Token verification error:', error);
    return null;
  }
}

export function getTokenFromRequest(req: any): string | null {
  // Try to get token from Authorization header
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  // Try to get token from query string
  if (req.query?.token) {
    return req.query.token;
  }

  return null;
}

export function requireAuth(req: any, res: any): TokenPayload | null {
  const token = getTokenFromRequest(req);
  
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }

  return decoded;
}

