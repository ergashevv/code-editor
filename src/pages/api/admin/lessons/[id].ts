// API route: PUT /api/admin/lessons/[id] - Update lesson (ADMIN only)
// API route: DELETE /api/admin/lessons/[id] - Delete lesson (ADMIN only)

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/mongodb';
import { requireAdmin, AuthRequest } from '../../../../lib/authMiddleware';
import Lesson from '../../../../models/Lesson';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await connectDB();

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      // Find lesson
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      return res.status(200).json({
        success: true,
        lesson,
      });
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      await connectDB();

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

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

      // Find lesson
      const lesson = await Lesson.findById(id);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      // Check slug uniqueness if changed
      if (slug && slug !== lesson.slug) {
        const existing = await Lesson.findOne({ slug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ error: 'Lesson with this slug already exists' });
        }
      }

      // Update lesson
      const updated = await Lesson.findByIdAndUpdate(
        id,
        {
          ...(slug && { slug }),
          ...(title && { title }),
          ...(summary !== undefined && { summary }),
          ...(contentMD !== undefined && { contentMD }),
          ...(examples !== undefined && { examples }),
          ...(trains !== undefined && { trains }),
          ...(homework !== undefined && { homework }),
          ...(unlockAt && { unlockAt: new Date(unlockAt) }),
          ...(order !== undefined && { order }),
          updatedAt: new Date(), // Update timestamp for cache invalidation
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        lesson: updated,
      });
    } catch (error: any) {
      console.error('Error updating lesson:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await connectDB();

      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      // Find and delete lesson
      const lesson = await Lesson.findByIdAndDelete(id);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting lesson:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

export default requireAdmin(handler);

