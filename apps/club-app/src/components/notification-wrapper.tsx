'use client';

import { useRouter } from 'next/navigation';
import { NotificationBubble } from '@nightlife-os/ui';
import { useAuth, useUnreadMessages, useNotifications } from '@nightlife-os/core';

/**
 * Notification-Wrapper
 * 
 * Phase 6: Client-Component für NotificationBubble im Layout
 * Phase 7: Erweitert um In-App Notifications
 * - Zeigt ungelesene Nachrichten + Notifications an
 * - Navigation zu /notifications
 */
export function NotificationWrapper() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalUnread: chatUnread } = useUnreadMessages(user?.uid);
  const { unreadCount: notificationUnread } = useNotifications(user?.uid);

  // Kombiniere Chat-Unread und Notification-Unread
  const totalUnread = (chatUnread || 0) + (notificationUnread || 0);

  if (!user || totalUnread === 0) return null;

  return (
    <NotificationBubble
      unreadCount={totalUnread}
      onClick={() => router.push('/notifications')}
      variant="banner"
    />
  );
}
