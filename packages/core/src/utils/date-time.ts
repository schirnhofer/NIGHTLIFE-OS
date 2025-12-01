/**
 * Datums- und Zeit-Funktionen
 * 
 * Wrapper um date-fns für konsistente Formatierung
 */

import { format, formatDistance, formatRelative } from 'date-fns';
import { de, enUS, fr, es, it } from 'date-fns/locale';

// Locale-Map
const locales: Record<string, Locale> = {
  de,
  en: enUS,
  fr,
  es,
  it,
};

/**
 * Formatiert einen Timestamp (ms) als lesbares Datum
 */
export function formatDate(
  timestamp: number,
  formatString = 'dd.MM.yyyy',
  locale = 'de'
): string {
  return format(timestamp, formatString, {
    locale: locales[locale] || locales.de,
  });
}

/**
 * Formatiert einen Timestamp (ms) als Zeit
 */
export function formatTime(
  timestamp: number,
  formatString = 'HH:mm',
  locale = 'de'
): string {
  return format(timestamp, formatString, {
    locale: locales[locale] || locales.de,
  });
}

/**
 * Formatiert einen Timestamp (ms) als Datum + Zeit
 */
export function formatDateTime(
  timestamp: number,
  formatString = 'dd.MM.yyyy HH:mm',
  locale = 'de'
): string {
  return format(timestamp, formatString, {
    locale: locales[locale] || locales.de,
  });
}

/**
 * Relative Zeit ("vor 2 Stunden", "in 3 Tagen")
 */
export function formatRelativeTime(
  timestamp: number,
  baseTimestamp = Date.now(),
  locale = 'de'
): string {
  return formatDistance(timestamp, baseTimestamp, {
    addSuffix: true,
    locale: locales[locale] || locales.de,
  });
}

/**
 * Relative Formatierung ("Heute um 14:30", "Gestern um 20:15")
 */
export function formatRelativeDate(
  timestamp: number,
  baseTimestamp = Date.now(),
  locale = 'de'
): string {
  return formatRelative(timestamp, baseTimestamp, {
    locale: locales[locale] || locales.de,
  });
}
