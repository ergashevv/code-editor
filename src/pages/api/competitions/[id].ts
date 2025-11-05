// API route for users to get a specific competition

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import Competition from '../../../models/Competition';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Competition ID is required' });
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

    // Get competition
    const competition = await Competition.findById(id).lean() as any;

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Check if competition is active
    if (!competition.active) {
      return res.status(403).json({ error: 'Competition is not active' });
    }

    const now = new Date();
    const unlockAt = new Date(competition.unlockAt);
    const isUnlocked = unlockAt <= now;

    return res.status(200).json({
      success: true,
      competition: {
        ...competition,
        isUnlocked,
        locked: !isUnlocked,
      },
    });
  } catch (error: any) {
    console.error('Error fetching competition:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

