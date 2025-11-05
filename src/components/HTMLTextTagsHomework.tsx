'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';

interface HomeworkTask {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  example?: string;
  solution?: string;
}

export default function HTMLTextTagsHomework({ isOpen, onClose, isMobile = false, onLoadCode }: { 
  isOpen: boolean; 
  onClose: () => void; 
  isMobile?: boolean;
  onLoadCode?: (html: string) => void;
}) {
  const { t } = useI18n();
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<{ [key: string]: boolean }>({});

  const tasks: HomeworkTask[] = [
    {
      id: 'task1',
      title: t('homeworkTask1Title'),
      description: t('homeworkTask1Desc'),
      requirements: [
        t('homeworkTask1Req1'),
        t('homeworkTask1Req2'),
        t('homeworkTask1Req3'),
        t('homeworkTask1Req4')
      ],
      example: t('homeworkTask1Example'),
      solution: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Mening birinchi sahifam</title>
</head>
<body>
  <h1>Mening ismim</h1>
  <h2>Men haqimda</h2>
  <p>Men <b>o'quvchi</b>man va <i>HTML</i> o'rganyapman.</p>
  
  <h2>Sevimli o'yinlarim</h2>
  <ul>
    <li>Futbol</li>
    <li>Basketbol</li>
    <li>Shaxmat</li>
  </ul>
  
  <h2>Kun tartibi</h2>
  <ol>
    <li>Uyg'onish</li>
    <li>Nonushta</li>
    <li>Maktab</li>
    <li>Uyga vazifa</li>
  </ol>
</body>
</html>`
    },
    {
      id: 'task2',
      title: t('homeworkTask2Title'),
      description: t('homeworkTask2Desc'),
      requirements: [
        t('homeworkTask2Req1'),
        t('homeworkTask2Req2'),
        t('homeworkTask2Req3'),
        t('homeworkTask2Req4')
      ],
      example: t('homeworkTask2Example'),
      solution: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Kitob tavsifi</title>
</head>
<body>
  <h1 class="sarlavha">Sevimli kitobim</h1>
  
  <p class="paragraf">Bu kitob haqida:</p>
  <p>Kitob nomi: <b>HTML asoslari</b></p>
  <p>Muallif: <i>John Doe</i></p>
  
  <h2>Kitob haqida</h2>
  <p>Bu kitob <strong>HTML</strong> o'rganish uchun juda <em>foydali</em>.</p>
  
  <h2>Kitobning afzalliklari</h2>
  <ul class="afzalliklar">
    <li>Oson tushunish</li>
    <li>Ko'p misollar</li>
    <li>Amaliy topshiriqlar</li>
  </ul>
</body>
</html>`
    },
    {
      id: 'task3',
      title: t('homeworkTask3Title'),
      description: t('homeworkTask3Desc'),
      requirements: [
        t('homeworkTask3Req1'),
        t('homeworkTask3Req2'),
        t('homeworkTask3Req3')
      ],
      example: t('homeworkTask3Example'),
      solution: `<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <title>Shaxsiy ma'lumotlar</title>
</head>
<body>
  <h1>Shaxsiy ma'lumotlar</h1>
  
  <h2>Ism</h2>
  <p>Mening ismim <b>Ali</b></p>
  
  <h2>Yosh</h2>
  <p>Men <strong>12 yoshda</strong>man</p>
  
  <h2>Maktab</h2>
  <p>Men <i>Texnikum</i> maktabida o'qiyman</p>
  
  <h2>Sevimli fanlarim</h2>
  <ol>
    <li>Matematika</li>
    <li>Informatika</li>
    <li>Ingliz tili</li>
  </ol>
  
  <h2>Qiziqishlarim</h2>
  <ul>
    <li>Dasturlash</li>
    <li>Kitob o'qish</li>
    <li>Futbol</li>
  </ul>
  
  <p>Har kuni maktabga boraman<br>
  Uyga vazifa qilaman<br>
  Dars o'qiyman</p>
</body>
</html>`
    }
  ];

  const toggleTask = (id: string) => {
    setActiveTask(activeTask === id ? null : id);
  };

  const toggleSolution = (id: string) => {
    setShowSolution(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadSolution = (solution: string) => {
    if (onLoadCode) {
      onLoadCode(solution);
      onClose();
    }
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
            <div className="px-6 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white">
              <div className="flex items-center justify-between">
                <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  {t('homeworkTitle')}
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
                {t('homeworkSubtitle')}
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📝</span>
                        <div>
                          <h3 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white`}>
                            {task.title}
                          </h3>
                          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${activeTask === task.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {activeTask === task.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                            <div className="mb-4">
                              <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-2`}>
                                {t('homeworkRequirements')}:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                {task.requirements.map((req, idx) => (
                                  <li key={idx}>{req}</li>
                                ))}
                              </ul>
                            </div>

                            {task.example && (
                              <div className="mb-4">
                                <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold text-gray-900 dark:text-white mb-2`}>
                                  {t('homeworkExample')}:
                                </h4>
                                <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
                                  <div dangerouslySetInnerHTML={{ __html: task.example }} />
                                </div>
                              </div>
                            )}

                            {task.solution && (
                              <div className="space-y-2">
                                <button
                                  onClick={() => toggleSolution(task.id)}
                                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                  {showSolution[task.id] ? t('homeworkHideSolution') : t('homeworkShowSolution')}
                                </button>

                                {showSolution[task.id] && (
                                  <div className="space-y-2">
                                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                                      <code>{task.solution}</code>
                                    </pre>
                                    <button
                                      onClick={() => loadSolution(task.solution || '')}
                                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-sm"
                                    >
                                      {t('homeworkLoadCode')}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
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
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
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

