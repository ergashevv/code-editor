'use client';

import { motion } from 'framer-motion';
import { useI18n, Language } from '../hooks/useI18n';

interface LanguageToggleProps {
  isMobile?: boolean;
}

export default function LanguageToggle({ isMobile = false }: LanguageToggleProps) {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'uz', label: 'UZ', flag: '🇺🇿' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  return (
    <div className={`inline-flex items-center ${isMobile ? 'gap-0.5' : 'gap-1'} bg-gray-200 dark:bg-gray-700 rounded-lg ${isMobile ? 'p-0.5' : 'p-1'}`}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`${isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-1.5 text-sm'} rounded-md font-medium transition-all duration-150 touch-manipulation flex items-center gap-1.5 ${
            language === lang.code
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <span className="text-base leading-none">{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

