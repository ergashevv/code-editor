// API route: GET /api/progress/lesson/[lessonId] - Get user progress for a lesson

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongodb';
import { requireAuth, AuthRequest } from '../../../../lib/authMiddleware';
import Progress from '../../../../models/Progress';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { lessonId } = req.query;

    if (!lessonId || typeof lessonId !== 'string') {
      return res.status(400).json({ error: 'lessonId is required' });
    }

    // Get progress for this user and lesson
    const progress = await Progress.findOne({
      userId: req.userId,
      lessonId: lessonId,
    }).lean();

    return res.status(200).json({
      success: true,
      progress: progress || {
        trainsCompleted: [],
        homeworkSubmitted: false,
        xpEarned: 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAuth(handler);

