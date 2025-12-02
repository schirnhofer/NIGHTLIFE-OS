/**
 * FCM Token Manager for Nightlife OS
 * Phase 8: Push Notifications
 * 
 * Verwaltet FCM-Tokens für Push-Benachrichtigungen
 */

import { getToken, deleteToken, Messaging } from 'firebase/messaging';
import { getFirestoreInstance } from '../firebase/init';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

/**
 * VAPID Key für FCM Web Push
 * WICHTIG: Muss durch echten VAPID Key aus Firebase Console ersetzt werden!
 * Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
 */
const VAPID_KEY = 'YOUR_VAPID_KEY_HERE';

/**
 * Registriert den aktuellen Browser für Push-Benachrichtigungen
 * Holt FCM-Token und speichert ihn im User-Profil
 * 
 * @param messaging - Firebase Messaging Instanz
 * @param userId - User ID
 * @returns Promise mit dem FCM-Token
 */
export async function registerForPushNotifications(
  messaging: Messaging | null,
  userId: string
): Promise<string | null> {
  if (!messaging) {
    console.error('Firebase Messaging not initialized');
    return null;
  }

  try {
    // Berechtigung anfordern
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // FCM-Token holen
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      // Token im User-Profil speichern
      const db = getFirestoreInstance();
      const userRef = doc(db, `platform/users/${userId}`);
      
      await updateDoc(userRef, {
        fcmTokens: arrayUnion(token),
        pushEnabled: true,
      });
      
      console.log('FCM token registered:', token.substring(0, 20) + '...');
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Deregistriert den aktuellen Browser von Push-Benachrichtigungen
 * Löscht FCM-Token und entfernt ihn aus dem User-Profil
 * 
 * @param messaging - Firebase Messaging Instanz
 * @param userId - User ID
 */
export async function unregisterFromPushNotifications(
  messaging: Messaging | null,
  userId: string
): Promise<void> {
  if (!messaging) {
    console.error('Firebase Messaging not initialized');
    return;
  }

  try {
    // Aktuellen Token holen
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    
    if (token) {
      // Token löschen
      await deleteToken(messaging);
      
      // Token aus User-Profil entfernen
      const db = getFirestoreInstance();
      const userRef = doc(db, `platform/users/${userId}`);
      
      await updateDoc(userRef, {
        fcmTokens: arrayRemove(token),
      });
      
      console.log('FCM token unregistered');
    }
  } catch (error) {
    console.error('Error unregistering from push notifications:', error);
  }
}

/**
 * Aktualisiert den Push-Benachrichtigungs-Status im User-Profil
 * 
 * @param userId - User ID
 * @param enabled - true = Push aktiviert, false = deaktiviert
 */
export async function setPushNotificationStatus(
  userId: string,
  enabled: boolean
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const userRef = doc(db, `platform/users/${userId}`);
    
    await updateDoc(userRef, {
      pushEnabled: enabled,
    });
    
    console.log(`Push notifications ${enabled ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating push notification status:', error);
    throw error;
  }
}

/**
 * Prüft, ob der User Push-Benachrichtigungen aktiviert hat
 * 
 * @param userId - User ID
 * @returns Promise mit Push-Status (true = aktiviert, false = deaktiviert)
 */
export async function isPushNotificationEnabled(userId: string): Promise<boolean> {
  try {
    const db = getFirestoreInstance();
    const userRef = doc(db, `platform/users/${userId}`);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }
    
    const userData = userDoc.data();
    return userData?.pushEnabled ?? true; // Standard: true
  } catch (error) {
    console.error('Error checking push notification status:', error);
    return false;
  }
}
