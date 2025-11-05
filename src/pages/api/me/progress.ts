// API route: GET /api/me/progress - Get user progress

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { requireAuth, AuthRequest } from '../../../lib/authMiddleware';
import Progress from '../../../models/Progress';
import User from '../../../models/User';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get user progress for all lessons
    const progress = await Progress.find({ userId: req.userId })
      .populate('lessonId', 'slug title')
      .lean();

    // Get user details
    const user = await User.findById(req.userId).select('xp level').lean() as any;

    return res.status(200).json({
      success: true,
      progress,
      totalXp: user?.xp || 0,
      level: user?.level || 1,
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAuth(handler);

