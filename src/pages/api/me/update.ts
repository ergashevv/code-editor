import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import { getUserFromToken, AuthRequest } from '../../../lib/authMiddleware';
import User from '../../../models/User';

export default async function handler(
  req: AuthRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const auth = await getUserFromToken(req);
    
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { username, phone, password } = req.body;
    const userId = auth.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update username if provided
    if (username !== undefined) {
      const trimmedUsername = username.trim();
      if (trimmedUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username: trimmedUsername,
        _id: { $ne: userId }
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      
      user.username = trimmedUsername;
    }

    // Update phone if provided
    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      const phoneRegex = /^\+998-\d{2}-\d{3}-\d{2}-\d{2}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        return res.status(400).json({ error: 'Phone number must be in format: +998-XX-XXX-XX-XX' });
      }
      user.phone = trimmedPhone;
    }

    // Update password if provided (no old password required)
    if (password !== undefined && password.trim()) {
      if (password.length < 4) {
        return res.status(400).json({ error: 'Password must be at least 4 characters' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

