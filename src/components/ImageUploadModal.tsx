'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { readImageAsBase64 } from '../lib/fileUtils';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (base64Code: string) => void;
  isMobile?: boolean;
}

export default function ImageUploadModal({ isOpen, onClose, onInsert, isMobile = false }: ImageUploadModalProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [base64Code, setBase64Code] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB for base64)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('Image size is too large. Please use an image smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await readImageAsBase64(file);
      // Format image tag properly with line breaks for readability
      const imageTag = `<img src="${base64}" alt="Image" />`;
      setBase64Code(imageTag);
    } catch (error) {
      console.error('Failed to read image:', error);
      alert('Failed to read image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(base64Code);
    alert(t('copied'));
  };

  const handleInsert = () => {
    if (base64Code) {
      onInsert(base64Code);
      onClose();
      setBase64Code('');
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed ${isMobile ? 'inset-4' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'} bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 ${isMobile ? 'w-auto max-w-full' : 'w-96'} max-h-[80vh] overflow-y-auto`}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 dark:text-white`}>
                  {t('imageUpload')}
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

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? t('loading') : t('selectImage')}
              </button>

              {base64Code && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Image Preview */}
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 p-2">
                    <img 
                      src={base64Code.match(/src="([^"]+)"/)?.[1] || ''} 
                      alt="Preview" 
                      className="max-w-full max-h-48 mx-auto object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('base64Code')} ({base64Code.length} characters):
                    </label>
                    <textarea
                      readOnly
                      value={base64Code}
                      className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-xs overflow-x-auto"
                      rows={6}
                      style={{ wordBreak: 'break-all' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      {t('copyBase64')}
                    </button>
                    <button
                      onClick={handleInsert}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      {t('save')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

