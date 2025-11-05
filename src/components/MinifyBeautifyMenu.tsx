'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { minifyHTML, minifyCSS, minifyJS, beautifyHTML, beautifyCSS, beautifyJS } from '../lib/minifyUtils';

interface MinifyBeautifyMenuProps {
  html: string;
  css: string;
  js: string;
  activeTab: 'html' | 'css' | 'javascript';
  onUpdate: (html: string, css: string, js: string) => void;
  isMobile?: boolean;
}

export default function MinifyBeautifyMenu({ 
  html, 
  css, 
  js, 
  activeTab,
  onUpdate,
  isMobile = false 
}: MinifyBeautifyMenuProps) {
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

  const handleMinify = () => {
    let newHtml = html;
    let newCss = css;
    let newJs = js;

    if (activeTab === 'html') {
      newHtml = minifyHTML(html);
    } else if (activeTab === 'css') {
      newCss = minifyCSS(css);
    } else if (activeTab === 'javascript') {
      newJs = minifyJS(js);
    }

    onUpdate(newHtml, newCss, newJs);
    setIsOpen(false);
  };

  const handleBeautify = () => {
    let newHtml = html;
    let newCss = css;
    let newJs = js;

    if (activeTab === 'html') {
      newHtml = beautifyHTML(html);
    } else if (activeTab === 'css') {
      newCss = beautifyCSS(css);
    } else if (activeTab === 'javascript') {
      newJs = beautifyJS(js);
    }

    onUpdate(newHtml, newCss, newJs);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} bg-gray-100 dark:bg-gray-800 dark:text-white active:bg-gray-200 dark:active:bg-gray-700 text-gray-700 rounded-lg font-medium transition-all touch-manipulation flex items-center gap-1.5`}
        title={t('minify')}
      >
        <svg className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {!isMobile && <span>...</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
          >
            <button
              onClick={handleMinify}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('minify')}
            </button>
            <button
              onClick={handleBeautify}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {t('beautify')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

