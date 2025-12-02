'use client';

import { useRouter } from 'next/navigation';
import { NotificationBubble } from '@nightlife-os/ui';
import { useAuth, useUnreadMessages } from '@nightlife-os/core';

/**
 * Notification-Wrapper
 * 
 * Phase 6: Client-Component für NotificationBubble im Layout
 * - Zeigt ungelesene Nachrichten an
 * - Navigation zu /crew
 */
export function NotificationWrapper() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalUnread } = useUnreadMessages(user?.uid);

  if (!user || totalUnread === 0) return null;

  return (
    <NotificationBubble
      unreadCount={totalUnread}
      onClick={() => router.push('/crew')}
      variant="banner"
    />
  );
}
