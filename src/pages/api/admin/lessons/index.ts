// API route: POST /api/admin/lessons - Create lesson (ADMIN only)

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { requireAdmin, AuthRequest } from '../../../lib/authMiddleware';
import Lesson from '../../../models/Lesson';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const {
      slug,
      title,
      summary,
      contentMD,
      examples,
      trains,
      homework,
      unlockAt,
      order,
    } = req.body;

    // Validation
    if (!slug || !title || !summary || !contentMD) {
      return res.status(400).json({ error: 'slug, title, summary, and contentMD are required' });
    }

    // Check if slug already exists
    const existing = await Lesson.findOne({ slug });
    if (existing) {
      return res.status(400).json({ error: 'Lesson with this slug already exists' });
    }

    // Create lesson
    const lesson = await Lesson.create({
      slug,
      title,
      summary,
      contentMD,
      examples: examples || [],
      trains: trains || [],
      homework,
      unlockAt: unlockAt ? new Date(unlockAt) : new Date(),
      order: order || 0,
    });

    return res.status(201).json({
      success: true,
      lesson,
    });
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAdmin(handler);

