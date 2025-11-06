'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';
import { templates, Template } from '../lib/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  isMobile?: boolean;
}

export default function TemplatesModal({ isOpen, onClose, onSelectTemplate, isMobile = false }: TemplatesModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  // Anime.js animations for templates modal
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

      // Modal entrance
      if (modalRef.current) {
        animate(
          modalRef.current,
          {
            opacity: [0, 1],
            scale: [0.9, 1],
            translateY: [30, 0],
            rotateZ: [-2, 0],
            duration: 600,
            easing: 'easeOutElastic(1, .6)',
          }
        );
      }

      // Templates stagger animation
      setTimeout(() => {
        if (templatesRef.current) {
          const templateCards = templatesRef.current.querySelectorAll('button');
          animate(
            templateCards,
            {
              opacity: [0, 1],
              translateY: [30, 0],
              scale: [0.95, 1],
              duration: 500,
              delay: (el: any, i: number) => i * 100,
              easing: 'easeOutExpo',
            }
          );
        }
      }, 300);
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
            className={`fixed ${isMobile ? 'inset-2' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 ${isMobile ? 'w-auto' : 'w-[600px]'} max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
                  {t('templates')}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div ref={templatesRef} className="grid grid-cols-1 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      onSelectTemplate(template);
                      onClose();
                    }}
                    className="text-left p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
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

