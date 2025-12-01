/**
 * Chats-Hook
 * 
 * Lädt Chatliste und Messages
 * Platzhalter für Phase 2
 */

'use client';

import { useState, useEffect } from 'react';
import { Chat, Message } from '@nightlife-os/shared-types';
import { onCollectionSnapshot, where } from '../firebase/firestore';

export interface UseChatsReturn {
  chats: Chat[];
  loading: boolean;
}

/**
 * Hook für Chatliste
 */
export function useChats(
  clubId: string | null,
  uid: string | null
): UseChatsReturn {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId || !uid) {
      setChats([]);
      setLoading(false);
      return;
    }

    // Listener für Chats (nur die, an denen User teilnimmt)
    const unsubscribe = onCollectionSnapshot<Chat>(
      `clubs/${clubId}/chats`,
      (data) => {
        // Filtere Chats nach participants
        const myChats = data.filter(chat => 
          chat.participants.includes(uid)
        );
        setChats(myChats);
        setLoading(false);
      },
      [where('participants', 'array-contains', uid)]
    );

    // Cleanup
    return () => unsubscribe();
  }, [clubId, uid]);

  return { chats, loading };
}

export interface UseChatMessagesReturn {
  messages: Message[];
  loading: boolean;
}

/**
 * Hook für Chat-Messages
 */
export function useChatMessages(
  clubId: string | null,
  chatId: string | null
): UseChatMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId || !chatId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // Listener für Messages
    const unsubscribe = onCollectionSnapshot<Message>(
      `clubs/${clubId}/chats/${chatId}/messages`,
      (data) => {
        setMessages(data);
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [clubId, chatId]);

  return { messages, loading };
}
