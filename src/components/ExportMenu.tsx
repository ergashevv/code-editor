'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { downloadHTML, downloadCSS, downloadJS, downloadZIP } from '../lib/exportUtils';

interface ExportMenuProps {
  html: string;
  css: string;
  js: string;
  isMobile?: boolean;
}

export default function ExportMenu({ html, css, js, isMobile = false }: ExportMenuProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { label: t('downloadHtml'), onClick: () => downloadHTML(html, css, js) },
    { label: t('downloadCss'), onClick: () => downloadCSS(css) },
    { label: t('downloadJs'), onClick: () => downloadJS(js) },
    { label: t('downloadZip'), onClick: () => downloadZIP(html, css, js) },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} bg-gray-100 dark:bg-gray-800 dark:text-white active:bg-gray-200 dark:active:bg-gray-700 text-gray-700 rounded-lg font-medium transition-all touch-manipulation flex items-center gap-1.5`}
        title={t('export')}
      >
        <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {!isMobile && <span>{t('export')}</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

