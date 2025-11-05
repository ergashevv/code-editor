// API route for admin to create, update, or delete a competition

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Competition from '../../../../models/Competition';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

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
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }


    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Competition ID is required' });
    }

    if (req.method === 'GET') {
      const competition = await Competition.findById(id).lean();
      if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
      }
      return res.status(200).json({ success: true, competition });
    }

    if (req.method === 'PUT') {
      const { title, title_uz, title_ru, title_en, description, description_uz, description_ru, description_en, unlockAt, active, order } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (title !== undefined) updateData.title = title;
      if (title_uz !== undefined) updateData.title_uz = title_uz;
      if (title_ru !== undefined) updateData.title_ru = title_ru;
      if (title_en !== undefined) updateData.title_en = title_en;
      if (description !== undefined) updateData.description = description;
      if (description_uz !== undefined) updateData.description_uz = description_uz;
      if (description_ru !== undefined) updateData.description_ru = description_ru;
      if (description_en !== undefined) updateData.description_en = description_en;
      if (unlockAt !== undefined) updateData.unlockAt = new Date(unlockAt);
      if (active !== undefined) updateData.active = active;
      if (order !== undefined) updateData.order = order;

      const competition = await Competition.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
      }

      return res.status(200).json({
        success: true,
        competition,
      });
    }

    if (req.method === 'DELETE') {
      const competition = await Competition.findByIdAndDelete(id);
      if (!competition) {
        return res.status(404).json({ error: 'Competition not found' });
      }
      return res.status(200).json({
        success: true,
        message: 'Competition deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in competition management:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

