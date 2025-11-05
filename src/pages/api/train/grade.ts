// API route: POST /api/train/grade - Grade training exercise

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { requireAuth, AuthRequest } from '../../../lib/authMiddleware';
import { evaluateHtmlCss } from '../../../lib/grader';
import Lesson from '../../../models/Lesson';
import Submission from '../../../models/Submission';
import Progress from '../../../models/Progress';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { lessonId, trainId, html, css } = req.body;

    // Validation
    if (!lessonId || !trainId || !html) {
      return res.status(400).json({ error: 'lessonId, trainId, and html are required' });
    }

    // Get lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check if lesson is unlocked (unless admin)
    const isAdmin = req.user?.role === 'ADMIN';
    const now = new Date();
    if (!isAdmin && new Date(lesson.unlockAt) > now) {
      return res.status(403).json({ error: 'Lesson is locked' });
    }

    // Find train
    const train = lesson.trains.find((t: any) => t.id === trainId);
    if (!train) {
      return res.status(404).json({ error: 'Train exercise not found' });
    }

    // Grade the submission
    const checksResult = evaluateHtmlCss(html || '', css || '', train.checks);
    const passedAll = checksResult.every(check => check.passed);

    // Save submission
    await Submission.findOneAndUpdate(
      {
        userId: req.userId,
        lessonId: lesson._id,
        kind: 'TRAIN',
        targetId: trainId,
      },
      {
        userId: req.userId,
        lessonId: lesson._id,
        kind: 'TRAIN',
        targetId: trainId,
        html: html || '',
        css: css || '',
        checksResult,
        isFinal: false,
      },
      { upsert: true, new: true }
    );

    // Update progress if all checks passed
    if (passedAll) {
      await Progress.findOneAndUpdate(
        { userId: req.userId, lessonId: lesson._id },
        {
          $addToSet: { trainsCompleted: trainId },
        },
        { upsert: true, new: true }
      );
    }

    return res.status(200).json({
      success: true,
      passedAll,
      checksResult,
    });
  } catch (error: any) {
    console.error('Error grading train:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAuth(handler);

