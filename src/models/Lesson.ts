// Lesson model for MongoDB

import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
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
  js: {
    type: String,
    default: '',
  },
}, { _id: false });

const CheckSchema = new mongoose.Schema({
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
}, { _id: false });

const TrainSchema = new mongoose.Schema({
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
  task: {
    type: String,
    required: true,
  },
  task_uz: String,
  task_ru: String,
  task_en: String,
  initialHtml: {
    type: String,
    required: true,
  },
  initialCss: {
    type: String,
    default: '',
  },
  checks: {
    type: [CheckSchema],
    default: [],
  },
}, { _id: false });

const RubricItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  description_uz: String,
  description_ru: String,
  description_en: String,
  points: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const HomeworkSchema = new mongoose.Schema({
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
  brief: {
    type: String,
    required: true,
  },
  brief_uz: String,
  brief_ru: String,
  brief_en: String,
  rubric: {
    type: [RubricItemSchema],
    default: [],
  },
  checks: {
    type: [CheckSchema],
    default: [],
  },
}, { _id: false });

const LessonSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    title_uz: String,
    title_ru: String,
    title_en: String,
    summary: {
      type: String,
      required: true,
    },
    summary_uz: String,
    summary_ru: String,
    summary_en: String,
    contentMD: {
      type: String,
      required: true,
    },
    contentMD_uz: String,
    contentMD_ru: String,
    contentMD_en: String,
    examples: {
      type: [ExampleSchema],
      default: [],
    },
    trains: {
      type: [TrainSchema],
      default: [],
    },
    homework: {
      type: HomeworkSchema,
    },
    unlockAt: {
      type: Date,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);

