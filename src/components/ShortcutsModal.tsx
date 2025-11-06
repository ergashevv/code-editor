'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { useI18n } from '../hooks/useI18n';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export default function ShortcutsModal({ isOpen, onClose, isMobile = false }: ShortcutsModalProps) {
  const { t } = useI18n();
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  const shortcuts = [
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Ctrl', 'C'], description: 'Copy' },
    { keys: ['Ctrl', 'V'], description: 'Paste' },
    { keys: ['Ctrl', 'X'], description: 'Cut' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Y'], description: 'Redo' },
    { keys: ['Ctrl', 'F'], description: 'Find' },
    { keys: ['Ctrl', 'H'], description: 'Replace' },
    { keys: ['Ctrl', '/'], description: 'Toggle comment' },
    { keys: ['Alt', 'Shift', 'F'], description: 'Format document' },
    { keys: ['F11'], description: 'Toggle fullscreen' },
  ];

  // Anime.js animations for shortcuts modal
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

      // Shortcuts stagger animation
      setTimeout(() => {
        if (shortcutsRef.current) {
          const items = shortcutsRef.current.querySelectorAll('div');
          animate(
            items,
            {
              opacity: [0, 1],
              translateX: [-30, 0],
              scale: [0.95, 1],
              duration: 400,
              delay: (el: any, i: number) => i * 50,
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
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 ${isMobile ? 'w-auto' : 'w-96'} max-h-[90vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
                  {t('shortcuts')}
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

              <div ref={shortcutsRef} className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                    <div className="flex gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                        >
                          {key}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

