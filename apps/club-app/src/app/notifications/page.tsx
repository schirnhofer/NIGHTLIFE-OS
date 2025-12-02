'use client';

/**
 * Notifications Page
 * Phase 7: Anzeige aller In-App Notifications
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useNotifications } from '@nightlife-os/core';
import { Button, Card, Loader, NotificationListItem } from '@nightlife-os/ui';
import { ArrowLeft, CheckCheck } from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useNotifications(user?.uid);

  // Redirect wenn nicht eingeloggt
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleNotificationClick = async (notificationId: string, data?: Record<string, any>) => {
    // Markiere als gelesen
    await markNotificationAsRead(notificationId);

    // Navigiere zu Chat wenn vorhanden
    if (data?.chatId) {
      router.push(`/crew/chat/${data.chatId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Loading
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/crew')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Benachrichtigungen
                </h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-cyan-400">
                    {unreadCount} ungelesen
                  </p>
                )}
              </div>
            </div>

            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllRead}
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Alle gelesen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4">
        {notifications.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-slate-400 text-lg">
                🔔 Keine Benachrichtigungen
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationListItem
                key={notification.notificationId}
                notification={notification}
                onClick={() => handleNotificationClick(
                  notification.notificationId, 
                  notification.data
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
