'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import uzTranslations from '../i18n/uz.json';
import ruTranslations from '../i18n/ru.json';
import enTranslations from '../i18n/en.json';

export type Language = 'uz' | 'ru' | 'en';

const translations: Record<Language, Record<string, string>> = {
  uz: uzTranslations,
  ru: ruTranslations,
  en: enTranslations,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  mounted: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' on server-side to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  // Read from localStorage after mount (client-side only)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem('editor-language');
        if (stored) {
          const parsed = JSON.parse(stored) as Language;
          if (parsed === 'uz' || parsed === 'ru' || parsed === 'en') {
            setLanguageState(parsed);
          }
        }
      } catch (error) {
        console.error('Error reading language from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage when language changes
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('editor-language', JSON.stringify(language));
      } catch (error) {
        console.error('Error saving language to localStorage:', error);
      }
    }
  }, [language, mounted]);

  // Listen for language changes from other components
  useEffect(() => {
    if (!mounted) return;
    
    const handleLanguageChange = (e: CustomEvent) => {
      setLanguageState(e.detail);
    };
    window.addEventListener('language-changed', handleLanguageChange as EventListener);
    return () => {
      window.removeEventListener('language-changed', handleLanguageChange as EventListener);
    };
  }, [mounted]);

  const t = (key: string): string => {
    // Use 'en' during SSR or before mount to avoid hydration mismatch
    const langToUse = mounted ? language : 'en';
    const lang = translations[langToUse];
    if (!lang) {
      return translations['en'][key] || key;
    }
    return lang[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Force re-render by triggering a custom event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
    }
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, mounted }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

