/**
 * i18n-Hook
 * 
 * Verwaltet Mehrsprachigkeit und Übersetzungen
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

// Wird später aus packages/ui/src/locales geladen
type Translations = Record<string, any>;

const DEFAULT_LOCALE = 'de';
const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'es', 'it'];

export interface UseI18nReturn {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/**
 * Hook für Mehrsprachigkeit
 */
export function useI18n(): UseI18nReturn {
  const [locale, setLocaleState] = useState(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Translations>({});

  // Lade Übersetzungen aus localStorage (oder Browser-Sprache)
  useEffect(() => {
    const savedLocale = localStorage.getItem('nightlife-os-locale');
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // Browser-Sprache erkennen
      const browserLang = navigator.language.split('-')[0];
      if (SUPPORTED_LOCALES.includes(browserLang)) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  // Übersetzungen laden (dynamisch)
  useEffect(() => {
    // TODO: Später aus packages/ui/src/locales laden
    // Für jetzt: Platzhalter
    setTranslations({
      'common.welcome': locale === 'de' ? 'Willkommen' : 'Welcome',
      'common.hello': locale === 'de' ? 'Hallo' : 'Hello',
      'common.loading': locale === 'de' ? 'Lade...' : 'Loading...',
    });
  }, [locale]);

  // Setze Sprache und speichere in localStorage
  const setLocale = useCallback((newLocale: string) => {
    if (SUPPORTED_LOCALES.includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem('nightlife-os-locale', newLocale);
    }
  }, []);

  // Übersetzungs-Funktion
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let translation = translations[key] || key;

      // Parameter ersetzen (z.B. "Hello {name}" -> "Hello John")
      if (params) {
        Object.keys(params).forEach(param => {
          translation = translation.replace(
            new RegExp(`{${param}}`, 'g'),
            String(params[param])
          );
        });
      }

      return translation;
    },
    [translations]
  );

  return { locale, setLocale, t };
}
