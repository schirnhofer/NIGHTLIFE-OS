import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import de from './de.json'
import en from './en.json'

export const defaultNS = 'translation'
export const resources = {
  de: {
    translation: de
  },
  en: {
    translation: en
  }
} as const

/**
 * Initialisiert i18next mit Browser-Language-Detection
 */
export const initI18n = () => {
  if (!i18n.isInitialized) {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        fallbackLng: 'de',
        defaultNS,
        interpolation: {
          escapeValue: false
        },
        detection: {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage']
        }
      })
  }
  return i18n
}

export { i18n }
