/**
 * Chat-Metadata für Unread-Tracking
 * 
 * Phase 6: Neue Datei für User-spezifische Chat-Metadaten
 * Speicherort: users/{uid}/chatMetadata/{chatId}
 */

/**
 * ChatMetadata (users/{uid}/chatMetadata/{chatId})
 * 
 * Speichert user-spezifische Chat-Daten:
 * - Wann hat der User den Chat zuletzt gesehen?
 * - Wie viele ungelesene Nachrichten hat er?
 */
export interface ChatMetadata {
  chatId: string;
  lastSeen: number; // Unix-Timestamp (ms) - wann hat der User den Chat zuletzt geöffnet?
  unreadCount?: number; // Optional: Anzahl ungelesener Nachrichten (kann berechnet werden)
}
