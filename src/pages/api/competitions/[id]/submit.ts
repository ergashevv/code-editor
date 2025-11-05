// API route for users to submit a challenge solution

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Competition from '../../../../models/Competition';
import { calculateLevelFromXp } from '../../../../lib/levelUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Competition ID is required' });
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
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get competition
    const competition = await Competition.findById(id);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    // Check if competition is active and unlocked
    if (!competition.active) {
      return res.status(403).json({ error: 'Competition is not active' });
    }

    const now = new Date();
    const unlockAt = new Date(competition.unlockAt);
    if (unlockAt > now) {
      return res.status(403).json({ error: 'Competition is locked' });
    }

    const { challengeId, passed, reward, html, css } = req.body;

    if (!challengeId || passed === undefined || !reward) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find challenge
    const challenge = competition.challenges?.find((c: any) => c.id === challengeId);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // If passed, award XP
    if (passed && reward > 0) {
      const newXp = (user.xp || 0) + reward;
      const newLevel = calculateLevelFromXp(newXp);

      await User.findByIdAndUpdate(user._id, {
        $set: {
          xp: newXp,
          level: newLevel,
        },
      });
    }

    // TODO: Save submission to database (create CompetitionSubmission model if needed)

    return res.status(200).json({
      success: true,
      message: passed ? `Challenge completed! You earned ${reward} XP!` : 'Challenge not completed',
      xpAwarded: passed ? reward : 0,
    });
  } catch (error: any) {
    console.error('Error submitting challenge:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Server error' });
  }
}

