/**
 * Chat-Messages-Hook
 * 
 * Aktionen für Chat-Nachrichten
 * Phase 3: Senden, Löschen, Ephemeral Images
 */

'use client';

import { useState } from 'react';
import { Message } from '@nightlife-os/shared-types';
import { setDocument, updateDocument, deleteDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { collection, doc } from 'firebase/firestore';

export interface UseChatMessagesActionsReturn {
  sending: boolean;
  sendMessage: (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    text?: string,
    image?: string,
    ephemeral?: number
  ) => Promise<void>;
  deleteMessage: (clubId: string, chatId: string, messageId: string) => Promise<void>;
  expireImage: (clubId: string, chatId: string, messageId: string) => Promise<void>;
}

/**
 * Hook für Chat-Message-Aktionen
 */
export function useChatMessagesActions(): UseChatMessagesActionsReturn {
  const [sending, setSending] = useState(false);

  /**
   * Sende neue Nachricht
   */
  const sendMessage = async (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    text?: string,
    image?: string,
    ephemeral?: number
  ): Promise<void> => {
    if (!text && !image) {
      throw new Error('Message must have text or image');
    }

    setSending(true);

    try {
      // Generiere Message-ID
      const db = getFirestoreInstance();
      const messagesRef = collection(db, `clubs/${clubId}/chats/${chatId}/messages`);
      const newMessageRef = doc(messagesRef);
      const messageId = newMessageRef.id;

      const now = Date.now();

      // Erstelle Message
      const newMessage: Message = {
        messageId,
        text: text || '',
        sender: senderId,
        senderName,
        image: image,
        ephemeral: ephemeral,
        expiresAt: ephemeral ? now + ephemeral * 1000 : undefined,
        viewedBy: [senderId], // Sender hat die Message bereits "gesehen"
        deleted: false,
        createdAt: now
      };

      // Speichere Message
      await setDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        newMessage
      );

      // Aktualisiere Chat lastMessage
      await updateDocument(`clubs/${clubId}/chats/${chatId}`, {
        lastMessageAt: now,
        lastMessagePreview: text || (image ? '🖼️ Bild' : '')
      });

      // Wenn ephemeral: Plane Auto-Löschung
      if (ephemeral) {
        setTimeout(async () => {
          try {
            await expireImage(clubId, chatId, messageId);
          } catch (err) {
            console.error('Error expiring message:', err);
          }
        }, ephemeral * 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  /**
   * Lösche Nachricht
   */
  const deleteMessage = async (
    clubId: string,
    chatId: string,
    messageId: string
  ): Promise<void> => {
    try {
      // Markiere als gelöscht (oder lösche komplett)
      await updateDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        {
          deleted: true,
          text: '',
          image: undefined
        }
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  /**
   * Lösche Bild aus Ephemeral-Message
   */
  const expireImage = async (
    clubId: string,
    chatId: string,
    messageId: string
  ): Promise<void> => {
    try {
      // Lösche nur das Bild, nicht die komplette Message
      await updateDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        {
          image: undefined,
          text: '[Bild abgelaufen]'
        }
      );
    } catch (error) {
      console.error('Error expiring image:', error);
      throw error;
    }
  };

  return {
    sending,
    sendMessage,
    deleteMessage,
    expireImage
  };
}
