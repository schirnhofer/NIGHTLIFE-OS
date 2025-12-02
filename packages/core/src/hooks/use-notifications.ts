'use client';

/**
 * useNotifications Hook
 * Phase 7: Verwaltet In-App Benachrichtigungen
 * 
 * Lädt Notifications aus users/{uid}/notifications
 * und bietet Funktionen zum Markieren als gelesen
 */

import { useState, useEffect } from 'react';
import { AppNotification } from '@nightlife-os/shared-types';
import { updateDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { collection, query, orderBy, limit as firestoreLimit, writeBatch, doc, onSnapshot } from 'firebase/firestore';

interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

/**
 * Hook für Notification-Management
 * 
 * @param uid - User-ID (null wenn nicht eingeloggt)
 * @param limitCount - Max. Anzahl zu ladender Notifications (default: 50)
 * @returns Notifications, unread count, und Funktionen
 */
export function useNotifications(
  uid: string | null | undefined,
  limitCount: number = 50
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const db = getFirestoreInstance();
    const notificationsRef = collection(db, `users/${uid}/notifications`);
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), firestoreLimit(limitCount));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: AppNotification[] = [];
        snapshot.forEach((docSnapshot) => {
          notifs.push(docSnapshot.data() as AppNotification);
        });
        setNotifications(notifs);
        setLoading(false);
      },
      (err: any) => {
        console.error('Error loading notifications:', err);
        setError('Fehler beim Laden der Benachrichtigungen');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, limitCount]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /**
   * Markiert eine einzelne Notification als gelesen
   */
  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!uid) return;
    
    try {
      const notificationPath = `users/${uid}/notifications/${notificationId}`;
      await updateDocument(notificationPath, { read: true });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  /**
   * Markiert alle Notifications als gelesen
   * Nutzt Firestore Batch für Performance
   */
  const markAllNotificationsAsRead = async (): Promise<void> => {
    if (!uid || notifications.length === 0) return;

    try {
      const db = getFirestoreInstance();
      const batch = writeBatch(db);
      
      notifications
        .filter((n) => !n.read)
        .forEach((notification) => {
          const notificationRef = doc(db, `users/${uid}/notifications/${notification.notificationId}`);
          batch.update(notificationRef, { read: true });
        });
      
      await batch.commit();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  };
}
