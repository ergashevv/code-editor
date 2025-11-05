// Submission model for MongoDB

import mongoose from 'mongoose';

const CheckResultSchema = new mongoose.Schema({
  checkId: {
    type: String,
    required: true,
  },
  passed: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
}, { _id: false });

const SubmissionSchema = new mongoose.Schema(
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
    kind: {
      type: String,
      enum: ['TRAIN', 'HOMEWORK'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    css: {
      type: String,
      default: '',
    },
    checksResult: {
      type: [CheckResultSchema],
      default: [],
    },
    score: {
      type: Number,
      min: 0,
    },
    isFinal: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster queries
SubmissionSchema.index({ userId: 1, lessonId: 1, kind: 1, targetId: 1 });
SubmissionSchema.index({ userId: 1, lessonId: 1, kind: 1, isFinal: 1 });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);

