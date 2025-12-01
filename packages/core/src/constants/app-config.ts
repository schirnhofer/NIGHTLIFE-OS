/**
 * Globale App-Konfiguration
 */

/**
 * Unterstützte Sprachen
 */
export const SUPPORTED_LOCALES = ['de', 'en', 'fr', 'es', 'it'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

/**
 * Standard-Sprache
 */
export const DEFAULT_LOCALE: SupportedLocale = 'de';

/**
 * Sprach-Labels
 */
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  de: 'Deutsch',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
};

/**
 * Firebase Collections (Haupt-Pfade)
 */
export const COLLECTIONS = {
  PLATFORM_CLUBS: 'platform/clubs',
  PLATFORM_GROUPS: 'platform/groups',
  PLATFORM_USERS: 'platform/users',
  CLUBS: 'clubs',
} as const;

/**
 * Default Trust-Level-Grenzwert
 */
export const DEFAULT_MIN_TRUST_LEVEL = 30;

/**
 * Friend-Code-Länge
 */
export const FRIEND_CODE_LENGTH = 7;

/**
 * Max. Anzahl Besuche in Historie
 */
export const MAX_VISIT_HISTORY = 10;

/**
 * Ephemeral-Image-Timer (Sekunden)
 */
export const EPHEMERAL_IMAGE_DURATIONS = [5, 10, 30] as const;
