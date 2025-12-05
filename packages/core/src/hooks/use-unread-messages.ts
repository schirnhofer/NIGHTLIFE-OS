/**
 * Unread-Messages-Hook
 * 
 * Phase 6: Tracking ungelesener Nachrichten für Notification-Bubble
 */

'use client';

import { useState, useEffect } from 'react';
import { onCollectionSnapshot, setDocument, getCollection, where, limit, orderBy } from '../firebase/firestore';
import { Chat, Message, ChatMetadata } from '@nightlife-os/shared-types';

export interface UseUnreadMessagesReturn {
  totalUnread: number;
  unreadByChat: Record<string, number>;
  loading: boolean;
  markChatAsSeen: (chatId: string) => Promise<void>;
}

/**
 * Hook zum Tracken ungelesener Nachrichten
 * 
 * @param uid User-ID (null falls nicht eingeloggt)
 * @param clubId Club-ID (default: 'demo-club-1')
 * @returns totalUnread, unreadByChat, markChatAsSeen
 */
export function useUnreadMessages(
  uid: string | null | undefined,
  clubId: string = 'demo-club-1'
): UseUnreadMessagesReturn {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChat, setUnreadByChat] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  /**
   * Markiere Chat als gelesen
   */
  const markChatAsSeen = async (chatId: string): Promise<void> => {
    if (!uid) return;

    try {
      const now = Date.now();
      const metadata: ChatMetadata = {
        chatId,
        lastSeen: now,
        unreadCount: 0
      };

      await setDocument(
        `users/${uid}/chatMetadata/${chatId}`,
        metadata
      );
    } catch (error) {
      console.error('Error marking chat as seen:', error);
      throw error;
    }
  };

  // Subscribe to unread messages
  useEffect(() => {
    if (!uid) {
      setTotalUnread(0);
      setUnreadByChat({});
      setLoading(false);
      return;
    }

    let unsubscribeChats: (() => void) | null = null;

    const setupUnreadTracking = async () => {
      try {
        // 1. Hole alle Chats des Users
        const chatsQuery = await getCollection<Chat>(
          `clubs/${clubId}/chats`,
          [where('participants', 'array-contains', uid)]
        );

        const chats = chatsQuery || [];

        // 2. Für jeden Chat: Lade lastSeen aus chatMetadata
        const unreadCounts: Record<string, number> = {};

        for (const chat of chats) {
          if (!chat?.id) continue;

          try {
            // Hole ChatMetadata
            const metadataList = await getCollection<ChatMetadata>(
              `users/${uid}/chatMetadata`,
              [where('chatId', '==', chat.id), limit(1)]
            );

            const metadata = metadataList?.[0];
            const lastSeen = metadata?.lastSeen || 0;

            // Zähle Messages nach lastSeen
            const messagesQuery = await getCollection<Message>(
              `clubs/${clubId}/chats/${chat.id}/messages`,
              [
                where('createdAt', '>', lastSeen),
                where('senderId', '!=', uid), // Nur fremde Messages
                orderBy('createdAt', 'desc')
              ]
            );

            const unreadMessages = messagesQuery || [];
            unreadCounts[chat.id] = unreadMessages.length;
          } catch (err) {
            console.error(`Error counting unread for chat ${chat.id}:`, err);
            unreadCounts[chat.id] = 0;
          }
        }

        // 3. Berechne Summe
        const total = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

        setUnreadByChat(unreadCounts);
        setTotalUnread(total);
        setLoading(false);

        // 4. Optional: Real-time Updates für neue Messages
        // (vereinfachte Variante: nur chats-Collection subscriben)
        unsubscribeChats = onCollectionSnapshot<Chat>(
          `clubs/${clubId}/chats`,
          async () => {
            // Re-count unread wenn sich Chats ändern
            setupUnreadTracking();
          },
          [where('participants', 'array-contains', uid)]
        );
      } catch (error) {
        console.error('Error setting up unread tracking:', error);
        setLoading(false);
      }
    };

    setupUnreadTracking();

    return () => {
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [uid, clubId]);

  return {
    totalUnread,
    unreadByChat,
    loading,
    markChatAsSeen
  };
}
