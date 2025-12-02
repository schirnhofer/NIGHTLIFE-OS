/**
 * Chat-Messages-Hook
 * 
 * Aktionen für Chat-Nachrichten
 * Phase 5: Erweitert um Media-Upload (Image, Audio, Video)
 */

'use client';

import { useState } from 'react';
import { Message, MessageType } from '@nightlife-os/shared-types';
import { setDocument, updateDocument, deleteDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { collection, doc } from 'firebase/firestore';
import { uploadChatMedia } from '../utils/storage';

export interface SendMessageOptions {
  text?: string;
  imageFile?: File;
  audioFile?: File;
  videoFile?: File;
  type?: MessageType;
  ephemeralSeconds?: number;
}

export interface UseChatMessagesActionsReturn {
  sending: boolean;
  sendMessage: (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    options: SendMessageOptions
  ) => Promise<void>;
  deleteMessage: (clubId: string, chatId: string, messageId: string) => Promise<void>;
  expireMedia: (
    clubId: string,
    chatId: string,
    messageId: string,
    replacementText?: string
  ) => Promise<void>;
}

/**
 * Hook für Chat-Message-Aktionen
 */
export function useChatMessagesActions(): UseChatMessagesActionsReturn {
  const [sending, setSending] = useState(false);

  /**
   * Sende neue Nachricht (Phase 5: mit Media-Upload)
   */
  const sendMessage = async (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    options: SendMessageOptions
  ): Promise<void> => {
    const { text, imageFile, audioFile, videoFile, type, ephemeralSeconds } = options;

    // Validierung
    if (!text && !imageFile && !audioFile && !videoFile) {
      throw new Error('Message must have text or media');
    }

    setSending(true);

    try {
      // Generiere Message-ID
      const db = getFirestoreInstance();
      const messagesRef = collection(db, `clubs/${clubId}/chats/${chatId}/messages`);
      const newMessageRef = doc(messagesRef);
      const messageId = newMessageRef.id;

      const now = Date.now();

      // Upload Media falls vorhanden
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'audio' | 'video' | undefined;
      let durationSeconds: number | undefined;

      if (imageFile) {
        const result = await uploadChatMedia(clubId, chatId, imageFile, 'image');
        mediaUrl = result.downloadUrl;
        mediaType = 'image';
      } else if (audioFile) {
        const result = await uploadChatMedia(clubId, chatId, audioFile, 'audio');
        mediaUrl = result.downloadUrl;
        mediaType = 'audio';
        // TODO: Extrahiere tatsächliche Audio-Dauer
        durationSeconds = 0; // Platzhalter
      } else if (videoFile) {
        const result = await uploadChatMedia(clubId, chatId, videoFile, 'video');
        mediaUrl = result.downloadUrl;
        mediaType = 'video';
        // TODO: Extrahiere tatsächliche Video-Dauer
        durationSeconds = 0; // Platzhalter
      }

      // Bestimme Message-Type
      let messageType: MessageType = type || 'text';
      if (imageFile) messageType = 'image';
      if (audioFile) messageType = 'audio';
      if (videoFile) messageType = 'video';

      // Erstelle Message
      const newMessage: Message = {
        messageId,
        type: messageType,
        text: text || undefined,
        mediaUrl,
        mediaType,
        durationSeconds,
        sender: senderId,
        senderName,
        ephemeral: ephemeralSeconds,
        expiresAt: ephemeralSeconds ? now + ephemeralSeconds * 1000 : undefined,
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
      let preview = text || '';
      if (imageFile) preview = '🖼️ Bild';
      if (audioFile) preview = '🎤 Sprachnachricht';
      if (videoFile) preview = '🎥 Video';

      await updateDocument(`clubs/${clubId}/chats/${chatId}`, {
        lastMessageAt: now,
        lastMessagePreview: preview
      });

      // Wenn ephemeral: Plane Auto-Löschung
      if (ephemeralSeconds) {
        setTimeout(async () => {
          try {
            await expireMedia(clubId, chatId, messageId);
          } catch (err) {
            console.error('Error expiring media:', err);
          }
        }, ephemeralSeconds * 1000);
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
          text: undefined,
          mediaUrl: undefined
        }
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  /**
   * Lösche Media aus Ephemeral-Message (Phase 5)
   */
  const expireMedia = async (
    clubId: string,
    chatId: string,
    messageId: string,
    replacementText?: string
  ): Promise<void> => {
    try {
      // Lösche nur das Media, nicht die komplette Message
      await updateDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        {
          mediaUrl: undefined,
          text: replacementText || '♻️ Medium gelöscht.',
          ephemeral: undefined,
          expiresAt: undefined
        }
      );
    } catch (error) {
      console.error('Error expiring media:', error);
      throw error;
    }
  };

  return {
    sending,
    sendMessage,
    deleteMessage,
    expireMedia
  };
}
