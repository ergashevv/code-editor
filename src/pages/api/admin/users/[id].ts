// API route for admin to update or delete a user

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (targetUser._id.toString() === adminUser._id.toString()) {
      return res.status(400).json({ error: 'Cannot modify your own account' });
    }

    if (req.method === 'GET') {
      // Get user details
      const user = await User.findById(id).select('-password').lean();
      return res.status(200).json({ success: true, user });
    }

    if (req.method === 'PUT') {
      // Update user
      const { username, phone, role, level, xp, password } = req.body;

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (username !== undefined) {
        const trimmedUsername = username.trim();
        if (trimmedUsername.length < 3) {
          return res.status(400).json({ error: 'Username must be at least 3 characters' });
        }
        // Check if username already exists (excluding current user)
        const existingUser = await User.findOne({ 
          username: trimmedUsername,
          _id: { $ne: id }
        });
        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        updateData.username = trimmedUsername;
      }

      if (phone !== undefined) {
        const trimmedPhone = phone.trim();
        const phoneRegex = /^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(trimmedPhone)) {
          return res.status(400).json({ error: 'Phone number must be in format: +998-XX-XXX-XX-XX' });
        }
        updateData.phone = trimmedPhone;
      }

      if (role !== undefined) {
        if (role !== 'USER' && role !== 'ADMIN') {
          return res.status(400).json({ error: 'Invalid role' });
        }
        updateData.role = role;
      }

      if (level !== undefined) {
        const levelNum = parseInt(level, 10);
        if (isNaN(levelNum) || levelNum < 1) {
          return res.status(400).json({ error: 'Level must be a positive number' });
        }
        updateData.level = levelNum;
      }

      if (xp !== undefined) {
        const xpNum = parseInt(xp, 10);
        if (isNaN(xpNum) || xpNum < 0) {
          return res.status(400).json({ error: 'XP must be a non-negative number' });
        }
        updateData.xp = xpNum;
      }

      if (password !== undefined && password !== '') {
        if (password.length < 4) {
          return res.status(400).json({ error: 'Password must be at least 4 characters' });
        }
        updateData.password = await bcrypt.hash(password, 10);
      }

      const updatedUser = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      return res.status(200).json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      });
    }

    if (req.method === 'DELETE') {
      // Delete user
      await User.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in user management:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.code === 11000 || error.code === 11001) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

