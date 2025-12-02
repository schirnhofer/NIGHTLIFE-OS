/**
 * Notifications Types for Nightlife OS
 * Phase 7: In-App Notifications & Multi-Channel Architecture
 */

/**
 * Verfügbare Benachrichtigungskanäle
 * In Phase 7: nur 'in_app' implementiert
 * Später: 'push' (FCM) und 'email'
 */
export type NotificationChannel = 'in_app' | 'push' | 'email';

/**
 * Typen von Benachrichtigungen
 */
export type NotificationType =
  | 'NEW_DIRECT_MESSAGE'        // Neue 1:1 Nachricht
  | 'NEW_GROUP_MESSAGE'         // Neue Gruppennachricht
  | 'NEW_BROADCAST_MESSAGE'     // Neue Broadcast-Nachricht
  | 'NEW_POLL'                  // Neue Umfrage
  | 'SYSTEM_ANNOUNCEMENT';      // System-Ankündigung

/**
 * In-App Benachrichtigung
 * Firestore: users/{uid}/notifications/{notificationId}
 */
export interface AppNotification {
  notificationId: string;       // Eindeutige ID
  userId: string;               // Empfänger-UID
  type: NotificationType;       // Benachrichtigungstyp
  title: string;                // Titel der Benachrichtigung
  body: string;                 // Benachrichtigungstext
  data?: Record<string, any>;   // Zusätzliche Daten (chatId, messageId, etc.)
  read: boolean;                // Gelesen-Status
  createdAt: number;            // Unix-Timestamp
}

/**
 * Optionen für das Dispatchen einer Benachrichtigung
 */
export interface DispatchNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}
