// API route: POST /api/admin/lessons/[id]/toggle - Toggle lesson active/lock status

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../lib/mongodb';
import { requireAdmin, AuthRequest } from '../../../../../lib/authMiddleware';
import Lesson from '../../../../../models/Lesson';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Lesson ID is required' });
    }

    const { action } = req.body; // 'lock', 'unlock', 'activate', 'deactivate'

    // Find lesson
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    let updated;
    const now = new Date();
    if (action === 'lock') {
      // Lock lesson by setting unlockAt to future date
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      updated = await Lesson.findByIdAndUpdate(
        id,
        { unlockAt: futureDate, active: true, updatedAt: now },
        { new: true }
      );
    } else if (action === 'unlock') {
      // Unlock lesson by setting unlockAt to past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      updated = await Lesson.findByIdAndUpdate(
        id,
        { unlockAt: pastDate, active: true, updatedAt: now },
        { new: true }
      );
    } else if (action === 'activate') {
      updated = await Lesson.findByIdAndUpdate(
        id,
        { active: true, updatedAt: now },
        { new: true }
      );
    } else if (action === 'deactivate') {
      updated = await Lesson.findByIdAndUpdate(
        id,
        { active: false, updatedAt: now },
        { new: true }
      );
    } else {
      return res.status(400).json({ error: 'Invalid action. Use: lock, unlock, activate, deactivate' });
    }

    return res.status(200).json({
      success: true,
      lesson: updated,
    });
  } catch (error: any) {
    console.error('Error toggling lesson:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAdmin(handler);

