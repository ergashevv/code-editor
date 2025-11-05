'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import { validateCSS, validateJS, ValidationResult } from '../lib/validationUtils';

interface ValidationPanelProps {
  css: string;
  js: string;
  isMobile?: boolean;
}

export default function ValidationPanel({ css, js, isMobile = false }: ValidationPanelProps) {
  const { t } = useI18n();
  const [cssResult, setCssResult] = useState<ValidationResult | null>(null);
  const [jsResult, setJsResult] = useState<ValidationResult | null>(null);

  const handleValidate = () => {
    setCssResult(validateCSS(css));
    setJsResult(validateJS(js));
  };

  return (
    <div className={`space-y-4 ${isMobile ? 'text-sm' : ''}`}>
      <button
        onClick={handleValidate}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {t('validate')}
      </button>

      {cssResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            cssResult.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">CSS {t('validation')}</span>
            <span className={cssResult.isValid ? 'text-green-600' : 'text-red-600'}>
              {cssResult.isValid ? t('valid') : t('invalid')}
            </span>
          </div>
          {cssResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-red-600 mb-1">{t('errors')}:</p>
              {cssResult.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  Line {error.line}: {error.message}
                </p>
              ))}
            </div>
          )}
          {cssResult.warnings.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-yellow-600 mb-1">{t('warnings')}:</p>
              {cssResult.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-600">
                  Line {warning.line}: {warning.message}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {jsResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            jsResult.isValid 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">JavaScript {t('validation')}</span>
            <span className={jsResult.isValid ? 'text-green-600' : 'text-red-600'}>
              {jsResult.isValid ? t('valid') : t('invalid')}
            </span>
          </div>
          {jsResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-red-600 mb-1">{t('errors')}:</p>
              {jsResult.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600">
                  Line {error.line}: {error.message}
                </p>
              ))}
            </div>
          )}
          {jsResult.warnings.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold text-yellow-600 mb-1">{t('warnings')}:</p>
              {jsResult.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-600">
                  Line {warning.line}: {warning.message}
                </p>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

