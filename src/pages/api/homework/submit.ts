// API route: POST /api/homework/submit - Submit homework (final once)

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/mongodb';
import { requireAuth, AuthRequest } from '../../../lib/authMiddleware';
import { evaluateHtmlCss } from '../../../lib/grader';
import { sendHomeworkTelegram } from '../../../lib/telegram';
import { calculateLevelFromXp } from '../../../lib/levelUtils';
import Lesson from '../../../models/Lesson';
import Submission from '../../../models/Submission';
import Progress from '../../../models/Progress';
import User from '../../../models/User';

async function handler(req: AuthRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { lessonId, html, css } = req.body;

    // Validation
    if (!lessonId || !html) {
      return res.status(400).json({ error: 'lessonId and html are required' });
    }

    // Get lesson
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    if (!lesson.homework) {
      return res.status(404).json({ error: 'Homework not found for this lesson' });
    }

    // Check if lesson is unlocked (unless admin)
    const isAdmin = req.user?.role === 'ADMIN';
    const now = new Date();
    if (!isAdmin && new Date(lesson.unlockAt) > now) {
      return res.status(403).json({ error: 'Lesson is locked' });
    }

    // Check if already submitted final
    const existingSubmission = await Submission.findOne({
      userId: req.userId,
      lessonId: lesson._id,
      kind: 'HOMEWORK',
      isFinal: true,
    });

    if (existingSubmission) {
      // Return existing submission data
      return res.status(200).json({
        success: true,
        accepted: existingSubmission.checksResult?.every((c: any) => c.passed) || false,
        locked: true,
        score: existingSubmission.score || 0,
        xpAwarded: 0, // XP already awarded, don't award again
        checksResult: existingSubmission.checksResult || [],
        message: 'Homework already submitted. You can only submit once.',
      });
    }

    // Grade the submission
    const checksResult = evaluateHtmlCss(html || '', css || '', lesson.homework.checks);
    const passedAll = checksResult.every(check => check.passed);

    // Calculate score from rubric
    // Score is calculated based on passed checks - har bir o'tgan check uchun ball qo'shiladi
    let score = 0;
    let xpAwarded = 0;
    
    if (lesson.homework.rubric && lesson.homework.rubric.length > 0) {
      // Calculate score based on passed checks
      // Match rubric items with checks by ID
      lesson.homework.rubric.forEach((rubricItem: any) => {
        const correspondingCheck = checksResult.find((c: any) => c.checkId === rubricItem.id);
        if (correspondingCheck && correspondingCheck.passed) {
          // Har bir o'tgan check uchun uning ballarini qo'shish
          score += rubricItem.points;
          xpAwarded += rubricItem.points; // Har bir o'tgan check uchun XP qo'shish
        }
      });
    } else {
      // If no rubric, calculate based on passed checks
      // Har bir o'tgan check uchun teng ball berish
      const passedCount = checksResult.filter((c: any) => c.passed).length;
      const totalCount = checksResult.length;
      
      if (totalCount > 0) {
        // Har bir o'tgan check uchun 100/totalCount ball
        const pointsPerCheck = Math.round(100 / totalCount);
        score = passedCount * pointsPerCheck;
        xpAwarded = score; // Har bir o'tgan check uchun XP
      }
    }

    // Debug logging
    console.log('Homework submission debug:', {
      userId: req.userId,
      lessonId: lesson._id,
      passedAll,
      score,
      hasRubric: !!lesson.homework.rubric,
      rubricLength: lesson.homework.rubric?.length || 0,
      rubricPoints: lesson.homework.rubric?.reduce((sum: number, item: any) => sum + item.points, 0) || 0,
      rubricItems: lesson.homework.rubric?.map((r: any) => ({ id: r.id, points: r.points })) || [],
      checksResult: checksResult.map(c => ({ checkId: c.checkId, passed: c.passed })),
      checksCount: checksResult.length,
      passedCount: checksResult.filter((c: any) => c.passed).length,
    });

    // Award XP and update level
    // XP is awarded for each passed check - har bir o'tgan check uchun XP qo'shiladi
    // xpAwarded is already calculated above based on passed checks
    if (xpAwarded > 0) {
      // Update user XP and level
      const user = await User.findById(req.userId);
      if (user) {
        const oldXp = user.xp || 0;
        const oldLevel = user.level || 1;
        user.xp = oldXp + xpAwarded;
        // Use progressive level system - har level uchun ko'proq XP kerak
        user.level = calculateLevelFromXp(user.xp);
        await user.save();
        
        console.log('XP updated:', {
          userId: req.userId,
          oldXp,
          oldLevel,
          xpAwarded,
          newXp: user.xp,
          newLevel: user.level,
          passedChecks: checksResult.filter((c: any) => c.passed).length,
          totalChecks: checksResult.length,
        });
      } else {
        console.error('User not found for XP update:', req.userId);
      }
    } else {
      console.log('XP not awarded:', {
        passedAll,
        score,
        xpAwarded,
        passedChecks: checksResult.filter((c: any) => c.passed).length,
        totalChecks: checksResult.length,
        reason: 'No checks passed or no rubric items matched',
      });
    }

    // Save final submission
    const submission = await Submission.create({
      userId: req.userId,
      lessonId: lesson._id,
      kind: 'HOMEWORK',
      targetId: lesson.homework.id,
      html: html || '',
      css: css || '',
      checksResult,
      score: score, // Save actual score (even if not all passed)
      isFinal: true,
    });

    // Update progress - always save if XP was awarded (even partially)
    // XP is awarded for each passed check, so we should save progress even if not all checks passed
    if (xpAwarded > 0 || passedAll) {
      await Progress.findOneAndUpdate(
        { userId: req.userId, lessonId: lesson._id },
        {
          homeworkSubmitted: true, // Mark as submitted even if partially completed
          $inc: { xpEarned: xpAwarded }, // Add XP for passed checks
        },
        { upsert: true, new: true }
      );
    }

    // Send Telegram notification if successful
    if (passedAll && xpAwarded > 0) {
      const user = await User.findById(req.userId);
      if (user) {
        await sendHomeworkTelegram({
          username: user.username,
          userId: user._id.toString(),
          lessonSlug: lesson.slug,
          lessonTitle: lesson.title,
          score,
          xpAwarded,
          submittedAt: submission.createdAt,
        });
      }
    }

    return res.status(200).json({
      success: true,
      accepted: passedAll,
      score: score, // Return actual score (even if not all passed)
      xpAwarded: xpAwarded, // Return XP awarded for passed checks
      checksResult,
      locked: false,
    });
  } catch (error: any) {
    console.error('Error submitting homework:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

export default requireAuth(handler);

