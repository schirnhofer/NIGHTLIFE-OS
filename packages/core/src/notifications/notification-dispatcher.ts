/**
 * Notification Dispatcher for Nightlife OS
 * Phase 7: Central notification system
 * 
 * Aktuell: In-App Notifications
 * Später: Push (FCM), E-Mail, KI-Übersetzung
 */

import { 
  AppNotification, 
  DispatchNotificationOptions,
  NotificationType 
} from '@nightlife-os/shared-types';
import { setDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { doc } from 'firebase/firestore';

/**
 * Dispatched eine Benachrichtigung an einen User
 * Speichert in: users/{userId}/notifications/{notificationId}
 * 
 * @param options - Notification-Optionen
 * @returns Promise mit der Notification-ID
 */
export async function dispatchNotification(
  options: DispatchNotificationOptions
): Promise<string> {
  const { userId, type, title, body, data } = options;

  const db = getFirestoreInstance();
  const notificationId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const notification: AppNotification = {
    notificationId,
    userId,
    type,
    title,
    body,
    data: data || {},
    read: false,
    createdAt: Date.now(),
  };

  const notificationRef = doc(db, `users/${userId}/notifications/${notificationId}`);
  
  try {
    await setDocument(notificationRef.path, notification);
    
    // TODO Phase 8+: 
    // - FCM Push Notification
    // - E-Mail Versand (bei wichtigen Events)
    // - KI-Übersetzung basierend auf user.language
    
    return notificationId;
  } catch (error) {
    console.error('Error dispatching notification:', error);
    throw error;
  }
}

/**
 * Dispatched Benachrichtigungen an mehrere User
 * Nützlich für Broadcast-Nachrichten
 * 
 * @param userIds - Array von User-IDs
 * @param type - Notification-Typ
 * @param title - Titel
 * @param body - Benachrichtigungstext
 * @param data - Zusätzliche Daten
 * @returns Promise mit Array von Notification-IDs
 */
export async function dispatchBulkNotifications(
  userIds: string[],
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<string[]> {
  const promises = userIds.map((userId) =>
    dispatchNotification({ userId, type, title, body, data })
  );
  
  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error dispatching bulk notifications:', error);
    throw error;
  }
}
