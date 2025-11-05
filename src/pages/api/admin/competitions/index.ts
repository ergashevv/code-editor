// API route for admin to get all competitions or create new

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Competition from '../../../../models/Competition';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    if (req.method === 'GET') {
      // Get all competitions
      const competitions = await Competition.find()
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        competitions,
      });
    }

    if (req.method === 'POST') {
      // Create new competition
      const { title, title_uz, title_ru, title_en, description, description_uz, description_ru, description_en, unlockAt, order } = req.body;

      if (!title || !description || !unlockAt) {
        return res.status(400).json({ error: 'Title, description, and unlockAt are required' });
      }

      const competition = await Competition.create({
        title,
        title_uz,
        title_ru,
        title_en,
        description,
        description_uz,
        description_ru,
        description_en,
        unlockAt: new Date(unlockAt),
        order: order || 0,
        active: true,
      });

      return res.status(201).json({
        success: true,
        competition,
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in competitions API:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}
