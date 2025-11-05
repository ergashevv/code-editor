// API route for admin to add XP to a user

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../lib/mongodb';
import User from '../../../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
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
    const adminUser = await User.findById(decoded.userId);
    
    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    const { xp } = req.body;

    if (!xp || typeof xp !== 'number' || xp <= 0 || !Number.isInteger(xp)) {
      return res.status(400).json({ error: 'XP must be a positive integer' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add XP to user
    const newXp = (targetUser.xp || 0) + xp;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { 
        xp: newXp,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    // Recalculate level based on new XP
    const newLevel = Math.floor(newXp / 100) + 1;
    if (newLevel !== targetUser.level) {
      await User.findByIdAndUpdate(id, { level: newLevel });
      updatedUser.level = newLevel;
    }

    return res.status(200).json({
      success: true,
      message: `Added ${xp} XP successfully`,
      user: {
        ...updatedUser.toObject(),
        level: newLevel,
      },
    });
  } catch (error: any) {
    console.error('Error adding XP:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

