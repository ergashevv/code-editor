'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { getHistory, deleteVersion, CodeVersion, saveVersion } from '../lib/historyUtils';

interface CodeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  html: string;
  css: string;
  js: string;
  onRestore: (version: CodeVersion) => void;
  isMobile?: boolean;
}

export default function CodeHistoryModal({ 
  isOpen, 
  onClose, 
  html, 
  css, 
  js, 
  onRestore,
  isMobile = false 
}: CodeHistoryModalProps) {
  const { t } = useI18n();
  const [history, setHistory] = useState<CodeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<CodeVersion | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  const handleSaveVersion = () => {
    const version = saveVersion(html, css, js);
    setHistory([version, ...history]);
  };

  const handleRestore = (version: CodeVersion) => {
    onRestore(version);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this version?')) {
      deleteVersion(id);
      setHistory(history.filter(v => v.id !== id));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 ${isMobile ? 'w-auto max-w-full' : 'w-96 max-h-[80vh]'} flex flex-col`}
          >
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
                  {t('history')}
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

              <button
                onClick={handleSaveVersion}
                className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t('saveVersion')}
              </button>

              {history.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  {t('noHistory')}
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((version) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border ${
                        selectedVersion?.id === version.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      } cursor-pointer transition-colors`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {version.label || formatDate(version.timestamp)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(version.timestamp)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestore(version);
                            }}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                          >
                            {t('restore')}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(version.id);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

