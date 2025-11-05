// API route: GET /api/leaderboard/global - Global leaderboard

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get all users sorted by XP (descending), then by level (descending)
    const users = await User.find({})
      .select('username level xp _id')
      .sort({ xp: -1, level: -1 })
      .lean();

    // Add rank
    const items = users.map((user, index) => ({
      userId: user._id.toString(),
      username: user.username,
      level: user.level || 1,
      xp: user.xp || 0,
      rank: index + 1,
    }));

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error('Error fetching global leaderboard:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

