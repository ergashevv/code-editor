// Authentication middleware for API routes

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from './mongodb';
import User from '../models/User';

export interface AuthRequest extends NextApiRequest {
  userId?: string;
  user?: any;
}

/**
 * Get user from JWT token
 */
export async function getUserFromToken(req: NextApiRequest): Promise<{ userId: string; user: any } | null> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies.token || 
                  (req.headers.cookie?.split('token=')[1]?.split(';')[0]);
    
    if (!token) {
      return null;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return null;
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    await connectDB();
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return null;
    }

    return {
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        username: user.username,
        phone: user.phone,
        role: user.role,
        level: user.level,
        xp: user.xp,
      },
    };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export function requireAuth(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    const auth = await getUserFromToken(req);
    
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.userId = auth.userId;
    req.user = auth.user;
    
    return handler(req, res);
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  handler: (req: AuthRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthRequest, res: NextApiResponse) => {
    const auth = await getUserFromToken(req);
    
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (auth.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    req.userId = auth.userId;
    req.user = auth.user;
    
    return handler(req, res);
  };
}

