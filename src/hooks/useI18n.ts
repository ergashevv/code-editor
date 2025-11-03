import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import uzTranslations from '../i18n/uz.json';
import ruTranslations from '../i18n/ru.json';
import enTranslations from '../i18n/en.json';

export type Language = 'uz' | 'ru' | 'en';

const translations: Record<Language, Record<string, string>> = {
  uz: uzTranslations,
  ru: ruTranslations,
  en: enTranslations,
};

export function useI18n() {
  // Always start with default to avoid hydration mismatch
  const [language, setLanguageState] = useState<Language>('uz');
  const [mounted, setMounted] = useState(false);

  // Read from localStorage only after mount (client-side only)
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
    const lang = translations[language];
    if (!lang) {
      return translations['uz'][key] || key;
    }
    return lang[key] || key;
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Force re-render by triggering a custom event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));
    }
  };

  return { language, setLanguage, t };
}

