'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';

interface LessonSection {
  id: string;
  title: string;
  description: string;
  example: string;
  explanation: string;
  code: string;
}

export default function HTMLTextTagsLesson({ isOpen, onClose, isMobile = false }: { isOpen: boolean; onClose: () => void; isMobile?: boolean }) {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections: LessonSection[] = [
    {
      id: 'headings',
      title: t('lessonHeadings'),
      description: t('lessonHeadingsDesc'),
      example: t('lessonHeadingsExample'),
      explanation: t('lessonHeadingsExplanation'),
      code: `<h1>Eng katta sarlavha</h1>
<h2>Ikkinchi darajali sarlavha</h2>
<h3>Uchinchi darajali sarlavha</h3>
<h4>To'rtinchi darajali sarlavha</h4>
<h5>Beshinchi darajali sarlavha</h5>
<h6>Eng kichik sarlavha</h6>`
    },
    {
      id: 'paragraph',
      title: t('lessonParagraph'),
      description: t('lessonParagraphDesc'),
      example: t('lessonParagraphExample'),
      explanation: t('lessonParagraphExplanation'),
      code: `<p>Bu oddiy paragraf. Bu yerda matn yoziladi.</p>
<p>Bu ikkinchi paragraf. Paragraflar bir-biridan pastga qarab joylashadi.</p>`
    },
    {
      id: 'lists',
      title: t('lessonLists'),
      description: t('lessonListsDesc'),
      example: t('lessonListsExample'),
      explanation: t('lessonListsExplanation'),
      code: `<!-- Tartibli ro'yxat (ol) -->
<ol>
  <li>Birinchi element</li>
  <li>Ikkinchi element</li>
  <li>Uchinchi element</li>
</ol>

<!-- Tartibsiz ro'yxat (ul) -->
<ul>
  <li>Element 1</li>
  <li>Element 2</li>
  <li>Element 3</li>
</ul>`
    },
    {
      id: 'linebreak',
      title: t('lessonLineBreak'),
      description: t('lessonLineBreakDesc'),
      example: t('lessonLineBreakExample'),
      explanation: t('lessonLineBreakExplanation'),
      code: `<p>Bu birinchi qator.<br>
Bu ikkinchi qator.<br>
Bu uchinchi qator.</p>`
    },
    {
      id: 'bold',
      title: t('lessonBold'),
      description: t('lessonBoldDesc'),
      example: t('lessonBoldExample'),
      explanation: t('lessonBoldExplanation'),
      code: `<p>Bu <b>qalin</b> matn.</p>
<p>Yoki <strong>muhim</strong> matn.</p>`
    },
    {
      id: 'italic',
      title: t('lessonItalic'),
      description: t('lessonItalicDesc'),
      example: t('lessonItalicExample'),
      explanation: t('lessonItalicExplanation'),
      code: `<p>Bu <i>kursiv</i> matn.</p>
<p>Yoki <em>vurguli</em> matn.</p>`
    },
    {
      id: 'class',
      title: t('lessonClass'),
      description: t('lessonClassDesc'),
      example: t('lessonClassExample'),
      explanation: t('lessonClassExplanation'),
      code: `<p class="muhim">Bu muhim paragraf</p>
<h1 class="sarlavha">Sarlavha</h1>
<div class="container">Kontainer</div>

<!-- CSS bilan -->
<style>
.muhim {
  color: red;
  font-weight: bold;
}
.sarlavha {
  color: blue;
  font-size: 32px;
}
</style>`
    }
  ];

  const toggleSection = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 ${isMobile ? 'w-auto max-w-full' : 'w-[90vw] max-w-4xl'} max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 dark:border-gray-700`}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  {t('lessonTitle')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-2 opacity-90`}>
                {t('lessonSubtitle')}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {section.id === 'headings' && '📝'}
                          {section.id === 'paragraph' && '📄'}
                          {section.id === 'lists' && '📋'}
                          {section.id === 'linebreak' && '↩️'}
                          {section.id === 'bold' && '💪'}
                          {section.id === 'italic' && '✍️'}
                          {section.id === 'class' && '🏷️'}
                        </span>
                        <div>
                          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white`}>
                            {section.title}
                          </h3>
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                            {section.description}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${activeSection === section.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {activeSection === section.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="mb-4">
                              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-2`}>
                                {t('lessonExample')}:
                              </h4>
                              <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-3">
                                <div dangerouslySetInnerHTML={{ __html: section.example }} />
                              </div>
                            </div>

                            <div className="mb-4">
                              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-2`}>
                                {t('lessonCode')}:
                              </h4>
                              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                                <code>{section.code}</code>
                              </pre>
                            </div>

                            <div>
                              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-2`}>
                                {t('lessonExplanation')}:
                              </h4>
                              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-700 dark:text-gray-300 leading-relaxed`}>
                                {section.explanation}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

