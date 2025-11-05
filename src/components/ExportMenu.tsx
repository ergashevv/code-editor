'use client';

import { useI18n } from '../hooks/useI18n';

interface ExportMenuProps {
  html: string;
  css: string;
  js: string;
  isMobile?: boolean;
  onOpen: () => void;
}

export default function ExportMenu({ html, css, js, isMobile = false, onOpen }: ExportMenuProps) {
  const { t } = useI18n();

  return (
    <button
      onClick={onOpen}
      className={`${isMobile ? 'p-1.5' : 'px-4 py-2'} bg-gray-100 dark:bg-gray-800 dark:text-white active:bg-gray-200 dark:active:bg-gray-700 text-gray-700 rounded-lg font-medium transition-all touch-manipulation flex items-center justify-center ${isMobile ? '' : 'gap-1.5'}`}
      title={t('export')}
    >
      <svg className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {!isMobile && <span className="text-sm">{t('export')}</span>}
    </button>
  );
}

