// Progress model for MongoDB

import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    trainsCompleted: {
      type: [String],
      default: [],
    },
    homeworkSubmitted: {
      type: Boolean,
      default: false,
    },
    xpEarned: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Index for faster queries
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1 });

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);

