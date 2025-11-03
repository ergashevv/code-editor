'use client';

import { motion } from 'framer-motion';
import { useI18n, Language } from '../hooks/useI18n';

interface LanguageToggleProps {
  isMobile?: boolean;
}

export default function LanguageToggle({ isMobile = false }: LanguageToggleProps) {
  const { language, setLanguage, t } = useI18n();

  const languages: { code: Language; label: string }[] = [
    { code: 'uz', label: 'UZ' },
    { code: 'ru', label: 'RU' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} bg-gray-100 dark:bg-gray-800 rounded-lg ${isMobile ? 'p-0.5' : 'p-1'}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md font-medium transition-all touch-manipulation ${
            language === lang.code
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 active:text-gray-900 dark:active:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}

