'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de'
    i18n.changeLanguage(newLang)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-all"
    >
      {i18n.language?.toUpperCase() || 'DE'}
    </button>
  )
}
