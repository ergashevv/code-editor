// API route: GET /api/leaderboard/weekly - Weekly leaderboard

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import Submission from '../../../models/Submission';
import User from '../../../models/User';

/**
 * Get start of current week (Monday 00:00)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

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

    const weekStart = getWeekStart();
    const now = new Date();

    // Get all homework submissions from this week
    const submissions = await Submission.find({
      kind: 'HOMEWORK',
      isFinal: true,
      createdAt: { $gte: weekStart, $lte: now },
    })
      .select('userId score')
      .lean();

    // Calculate weekly XP per user
    const weeklyXp: Record<string, number> = {};
    for (const sub of submissions) {
      const userId = sub.userId.toString();
      weeklyXp[userId] = (weeklyXp[userId] || 0) + (sub.score || 0);
    }

    // Get user details and calculate their weekly totals
    const userIds = Object.keys(weeklyXp);
    if (userIds.length === 0) {
      return res.status(200).json({
        success: true,
        items: [],
        weekStart,
      });
    }

    const users = await User.find({ _id: { $in: userIds } })
      .select('username level xp _id')
      .lean() as any[];

    // Create items with weekly XP
    const items = users
      .map((user: any) => ({
        userId: user._id.toString(),
        username: user.username,
        level: user.level || 1,
        xp: weeklyXp[user._id.toString()] || 0,
      }))
      .sort((a, b) => {
        // Sort by weekly XP descending, then by level
        if (b.xp !== a.xp) return b.xp - a.xp;
        return b.level - a.level;
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

    return res.status(200).json({
      success: true,
      items,
      weekStart,
    });
  } catch (error: any) {
    console.error('Error fetching weekly leaderboard:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

