// Competition model for MongoDB

import mongoose from 'mongoose';

const ChallengeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  title_uz: String,
  title_ru: String,
  title_en: String,
  description: {
    type: String,
    required: true,
  },
  description_uz: String,
  description_ru: String,
  description_en: String,
  html: {
    type: String,
    default: '',
  },
  css: {
    type: String,
    default: '',
  },
  js: {
    type: String,
    default: '',
  },
  reward: {
    type: Number,
    default: 0, // XP reward
  },
  checks: [{
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['html', 'css'],
      required: true,
    },
    rule: {
      type: String,
      required: true,
    },
    hint: {
      type: String,
      required: true,
    },
    hint_uz: String,
    hint_ru: String,
    hint_en: String,
  }],
}, { _id: false });

const CompetitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_uz: {
      type: String,
      trim: true,
    },
    title_ru: {
      type: String,
      trim: true,
    },
    title_en: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    description_uz: {
      type: String,
    },
    description_ru: {
      type: String,
    },
    description_en: {
      type: String,
    },
    challenges: {
      type: [ChallengeSchema],
      default: [],
    },
    unlockAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    },
    active: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Competition || mongoose.model('Competition', CompetitionSchema);

