'use client';

import { motion } from 'framer-motion';
import { useI18n } from '../hooks/useI18n';
import LanguageToggle from './LanguageToggle';

interface NavbarProps {
  onClear: () => void;
  isMobile?: boolean;
}

export default function Navbar({ onClear, isMobile = false }: NavbarProps) {
  const { t, language } = useI18n();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`bg-white border-b border-gray-200 ${isMobile ? 'px-2 py-2' : 'px-4 py-3'} shrink-0`}
    >
      <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'gap-4'} max-w-7xl mx-auto`}>
        <h1 className={`${isMobile ? 'text-base' : 'text-xl'} font-semibold text-gray-900 truncate`}>
          {t('appName')}
        </h1>
        
        <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-3'} flex-shrink-0`}>
          <LanguageToggle isMobile={isMobile} />
          
          <button
            onClick={onClear}
            className={`${isMobile ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'} bg-gray-100 active:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all touch-manipulation`}
          >
            {t('clear')}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

