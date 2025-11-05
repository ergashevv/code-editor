// API route: GET /api/lessons - List all lessons

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

    // Get user (optional - for role check)
    const auth = await getUserFromToken(req);
    const isAdmin = auth?.user?.role === 'ADMIN';
    const now = new Date();

    // Get all lessons (admin sees all, users see all active lessons including locked ones)
    const query: any = {};
    if (!isAdmin) {
      query.active = { $ne: false }; // Show active lessons (or undefined, which is treated as active)
      // Users can see locked lessons too, they'll just be marked as locked
    }
    const lessons = await Lesson.find(query).sort({ order: 1 }).lean() as any[];

    // Mark lessons as locked/unlocked based on unlockAt for non-admin users
    // (All lessons returned here are already unlocked for non-admin users)
    const filteredLessons = lessons.map((lesson: any) => {
      const isUnlocked = isAdmin || new Date(lesson.unlockAt) <= now;
      const isActive = lesson.active !== false;
      
      return {
        ...lesson,
        isUnlocked,
        locked: !isUnlocked, // Locked if unlockAt is in the future (only for admin)
        active: isActive,
      };
    });

    // Get last updated timestamp from lessons (for cache invalidation)
    // Always use the most recent updatedAt timestamp from all lessons
    const lastUpdated = lessons.length > 0 
      ? Math.max(...lessons.map((l: any) => {
          const updatedAt = l.updatedAt ? new Date(l.updatedAt).getTime() : 0;
          const createdAt = l.createdAt ? new Date(l.createdAt).getTime() : 0;
          return Math.max(updatedAt, createdAt);
        }))
      : Date.now();
    
    // Set cache headers to prevent browser/CDN caching (we handle cache client-side)
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json({
      success: true,
      lessons: filteredLessons,
      lastUpdated, // For cache versioning
    });
  } catch (error: any) {
    console.error('Error fetching lessons:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

