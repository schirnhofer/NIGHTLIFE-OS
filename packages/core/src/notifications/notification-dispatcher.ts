/**
 * Notification Dispatcher for Nightlife OS
 * Phase 7: Central notification system
 * Phase 8: Extended with FCM Push Notifications
 * 
 * Aktuell: In-App Notifications + Push (FCM)
 * Später: E-Mail, KI-Übersetzung
 */

import { 
  AppNotification, 
  DispatchNotificationOptions,
  NotificationType 
} from '@nightlife-os/shared-types';
import { setDocument, getDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Dispatched eine Benachrichtigung an einen User
 * Speichert in: users/{userId}/notifications/{notificationId}
 * Sendet Push-Benachrichtigung, wenn pushEnabled && fcmTokens vorhanden
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
    // 1) In-App Notification speichern (immer)
    await setDocument(notificationRef.path, notification);
    
    // 2) Push-Benachrichtigung senden (Phase 8)
    await sendPushNotificationIfEnabled(userId, title, body, type, data);
    
    // TODO Phase 9+: 
    // - E-Mail Versand (bei wichtigen Events)
    // - KI-Übersetzung basierend auf user.language
    
    return notificationId;
  } catch (error) {
    console.error('Error dispatching notification:', error);
    throw error;
  }
}

/**
 * Sendet Push-Benachrichtigung über Cloud Function
 * Nur wenn pushEnabled && fcmTokens vorhanden
 * 
 * @param userId - User ID
 * @param title - Titel
 * @param body - Text
 * @param type - Notification-Typ
 * @param data - Zusätzliche Daten
 */
async function sendPushNotificationIfEnabled(
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  data?: Record<string, any>
): Promise<void> {
  try {
    // User-Dokument laden
    const userPath = `platform/users/${userId}`;
    const userData = await getDocument(userPath);
    
    if (!userData) {
      return; // User nicht gefunden
    }
    
    // Prüfe pushEnabled && fcmTokens
    const pushEnabled = userData.pushEnabled ?? true; // Standard: true
    const fcmTokens = userData.fcmTokens || [];
    
    if (!pushEnabled || fcmTokens.length === 0) {
      return; // Push deaktiviert oder keine Tokens
    }
    
    // Cloud Function aufrufen
    const functions = getFunctions();
    const sendPushNotification = httpsCallable(functions, 'sendPushNotification');
    
    await sendPushNotification({
      targetUserIds: [userId],
      title,
      body,
      data: {
        type,
        ...data,
      },
    });
    
    console.log('Push notification sent to user:', userId);
  } catch (error) {
    // Fehler bei Push-Versand nicht werfen (In-App Notification wurde bereits gespeichert)
    console.error('Error sending push notification:', error);
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
