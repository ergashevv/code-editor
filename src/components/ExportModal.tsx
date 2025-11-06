'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { downloadHTML, downloadCSS, downloadJS, downloadZIP } from '../lib/exportUtils';
import { generatePDF, printCode } from '../lib/pdfUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  js: string;
  isMobile?: boolean;
}

export default function ExportModal({ isOpen, onClose, html, css, js, isMobile = false }: ExportModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const exportOptions = [
    { 
      id: 'html',
      label: t('downloadHtml'),
      icon: '📄',
      onClick: () => {
        downloadHTML(html, css, js);
        onClose();
      }
    },
    { 
      id: 'css',
      label: t('downloadCss'),
      icon: '🎨',
      onClick: () => {
        downloadCSS(css);
        onClose();
      }
    },
    { 
      id: 'js',
      label: t('downloadJs'),
      icon: '⚙️',
      onClick: () => {
        downloadJS(js);
        onClose();
      }
    },
    { 
      id: 'zip',
      label: t('downloadZip'),
      icon: '📦',
      onClick: () => {
        downloadZIP(html, css, js);
        onClose();
      }
    },
    { 
      id: 'pdf',
      label: t('exportPDF'),
      icon: '📑',
      onClick: async () => {
        try {
          await generatePDF(html, css, js);
          onClose();
        } catch (error) {
          console.error('PDF export error:', error);
        }
      }
    },
    { 
      id: 'print',
      label: t('print'),
      icon: '🖨️',
      onClick: () => {
        printCode(html, css, js);
        onClose();
      }
    },
  ];

  // Anime.js animations for modal
  useEffect(() => {
    if (isOpen) {
      // Backdrop fade in
      if (backdropRef.current) {
        animate(
          backdropRef.current,
          {
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutExpo',
          }
        );
      }

      // Modal entrance with bounce
      if (modalRef.current) {
        animate(
          modalRef.current,
          {
            opacity: [0, 1],
            scale: [0.8, 1],
            translateY: [30, 0],
            rotateZ: [-5, 0],
            duration: 600,
            easing: 'easeOutElastic(1, .6)',
          }
        );
      }

      // Options stagger animation
      setTimeout(() => {
        if (optionsRef.current) {
          const options = optionsRef.current.querySelectorAll('button');
          animate(
            options,
            {
              opacity: [0, 1],
              translateX: [-30, 0],
              scale: [0.9, 1],
              duration: 400,
              delay: (el: any, i: number) => i * 80,
              easing: 'easeOutExpo',
            }
          );
        }
      }, 200);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 ${isMobile ? 'w-auto max-w-full' : 'w-96'} max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
                  {t('export')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div ref={optionsRef} className="space-y-2">
                {exportOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={option.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all text-left group"
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {option.label}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

