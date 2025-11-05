// API route: GET /api/lessons/[slug] - Get one lesson

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { getUserFromToken } from '../../../lib/authMiddleware';
import Lesson from '../../../models/Lesson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { slug } = req.query;

    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Lesson slug is required' });
    }

    // Get user (optional - for role check)
    const auth = await getUserFromToken(req);
    const isAdmin = auth?.user?.role === 'ADMIN';
    const now = new Date();

    // Find lesson
    const query: any = { slug };
    if (!isAdmin) {
      query.active = { $ne: false }; // Users can only access active lessons
    }
    const lesson = await Lesson.findOne(query).lean() as any;

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if lesson is active (for non-admin users)
    if (!isAdmin && lesson.active === false) {
      return res.status(403).json({
        error: 'Lesson is not available',
        message: 'This lesson is currently inactive.',
      });
    }

    // Check if lesson is unlocked
    const isUnlocked = isAdmin || new Date(lesson.unlockAt) <= now;

    // For non-admin users, if lesson is locked, return lesson info but with locked status
    // This allows users to see locked lessons but not access their content
    if (!isUnlocked && !isAdmin) {
      return res.status(200).json({
        success: true,
        lesson: {
          ...lesson,
          isUnlocked: false,
          locked: true,
        },
        locked: true,
        unlockAt: lesson.unlockAt,
      });
    }

    return res.status(200).json({
      success: true,
      lesson: {
        ...lesson,
        isUnlocked: true,
        locked: false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching lesson:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

