// Utility to get lesson content in the correct language
// Technical terms (heading, link, tag, etc.) remain in English

import { Language } from '../hooks/useI18n';

export function getLocalizedLessonContent(lesson: any, language: Language) {
  if (!lesson) return lesson;

  const lang = language || 'en';
  
  // Debug: Check if translation fields exist
  const hasTranslation = lesson[`title_${lang}`] || lesson[`summary_${lang}`];
  if (!hasTranslation && lang !== 'en') {
    console.warn(`Lesson "${lesson.slug}" missing ${lang} translations, falling back to English`);
  }
  
  return {
    ...lesson,
    title: lesson[`title_${lang}`] || lesson.title || '',
    summary: lesson[`summary_${lang}`] || lesson.summary || '',
    contentMD: lesson[`contentMD_${lang}`] || lesson.contentMD || '',
    examples: (lesson.examples || []).map((example: any) => ({
      ...example,
      title: example[`title_${lang}`] || example.title || '',
      // Keep html, css, js as they are (not translated)
      html: example.html || '',
      css: example.css || '',
      js: example.js || '',
    })),
    trains: (lesson.trains || []).map((train: any) => ({
      ...train,
      title: train[`title_${lang}`] || train.title || '',
      task: train[`task_${lang}`] || train.task || '',
      checks: (train.checks || []).map((check: any) => ({
        ...check,
        hint: check[`hint_${lang}`] || check.hint || '',
      })),
    })),
    homework: lesson.homework ? {
      ...lesson.homework,
      title: lesson.homework[`title_${lang}`] || lesson.homework.title || '',
      brief: lesson.homework[`brief_${lang}`] || lesson.homework.brief || '',
      rubric: (lesson.homework.rubric || []).map((item: any) => ({
        ...item,
        description: item[`description_${lang}`] || item.description || '',
      })),
      checks: (lesson.homework.checks || []).map((check: any) => ({
        ...check,
        hint: check[`hint_${lang}`] || check.hint || '',
      })),
    } : undefined,
  };
}

