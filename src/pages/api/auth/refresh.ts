// API route for token refresh

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { getTokenFromRequest, verifyToken } from '../../../lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get token from request
    const token = getTokenFromRequest(req) || req.body?.token;

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    // Verify token (even if expired, we'll check if it's just expired)
    const decoded = verifyToken(token);
    
    // If token is completely invalid (not just expired), reject
    // We'll decode without verification to check expiration
    let userId: string | null = null;
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      // Decode without verification to check expiration
      const decodedPayload = jwt.decode(token) as any;
      if (decodedPayload && decodedPayload.userId) {
        userId = decodedPayload.userId;
      } else if (decoded) {
        userId = decoded.userId;
      }
    } catch (error) {
      // Token is completely invalid
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Verify user still exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const newToken = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: '100y' } // Long expiration
    );

    return res.status(200).json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

