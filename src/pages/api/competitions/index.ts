// API route for users to get competitions

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Competition from '../../../models/Competition';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Check authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get all active competitions
    const competitions = await Competition.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    const now = new Date();

    // Add isUnlocked flag for each competition
    const competitionsWithStatus = competitions.map((comp: any) => {
      const unlockAt = new Date(comp.unlockAt);
      const isUnlocked = unlockAt <= now;
      
      return {
        ...comp,
        isUnlocked,
        locked: !isUnlocked,
      };
    });

    return res.status(200).json({
      success: true,
      competitions: competitionsWithStatus,
    });
  } catch (error: any) {
    console.error('Error fetching competitions:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

