/**
 * Notification Settings Page
 * Phase 8: Push Notification Settings
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useI18n, setPushNotificationStatus, registerForPushNotifications, unregisterFromPushNotifications, getMessagingInstance } from '@nightlife-os/core';
import { Card, CardHeader, CardTitle, CardContent, Button, Loader } from '@nightlife-os/ui';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { onSnapshot, doc } from 'firebase/firestore';
import { getFirestoreInstance } from '@nightlife-os/core';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useI18n();
  
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  // User-Daten in Echtzeit abonnieren
  useEffect(() => {
    if (!user?.uid) return;
    
    const db = getFirestoreInstance();
    const userRef = doc(db, `platform/users/${user.uid}`);
    
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.data();
        setPushEnabled(userData?.pushEnabled ?? true);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login');
    }
  }, [user, authLoading, router]);

  // Push-Benachrichtigungen umschalten
  const handleTogglePush = async () => {
    if (!user?.uid) return;
    
    setUpdating(true);
    try {
      const newStatus = !pushEnabled;
      
      if (newStatus) {
        // Push aktivieren -> Token registrieren
        const messaging = getMessagingInstance();
        await registerForPushNotifications(messaging, user.uid);
      } else {
        // Push deaktivieren -> Token entfernen
        const messaging = getMessagingInstance();
        await unregisterFromPushNotifications(messaging, user.uid);
        await setPushNotificationStatus(user.uid, false);
      }
      
      setPushEnabled(newStatus);
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      alert('Fehler beim Ändern der Einstellungen');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-7 w-7 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">
              {t('settings.notifications')}
            </h1>
          </div>
        </div>

        {/* Push Notification Card */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {pushEnabled ? (
                <>
                  <Bell className="h-5 w-5 text-cyan-400" />
                  Push-Benachrichtigungen aktiviert
                </>
              ) : (
                <>
                  <BellOff className="h-5 w-5 text-slate-400" />
                  Push-Benachrichtigungen deaktiviert
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 mb-4">
              {pushEnabled
                ? 'Du erhältst Push-Benachrichtigungen für neue Nachrichten und Umfragen.'
                : 'Du erhältst keine Push-Benachrichtigungen. In-App Notifications sind weiterhin aktiv.'}
            </p>
            
            {/* Toggle Button */}
            <Button
              onClick={handleTogglePush}
              disabled={updating}
              className={`w-full ${
                pushEnabled
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              }`}
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : pushEnabled ? (
                'Push-Benachrichtigungen deaktivieren'
              ) : (
                'Push-Benachrichtigungen aktivieren'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <h3 className="text-white font-semibold mb-2">ℹ️ Hinweis</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Push-Benachrichtigungen funktionieren nur im Browser</li>
              <li>• Berechtigung muss im Browser erteilt werden</li>
              <li>• In-App Notifications sind immer aktiv</li>
            </ul>
          </CardContent>
        </Card>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mt-6 w-full text-white border-slate-700 hover:bg-slate-800/50"
        >
          {t('common.back')}
        </Button>
      </div>
    </div>
  );
}
