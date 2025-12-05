/**
 * Chat-Messages-Hook
 * 
 * Aktionen für Chat-Nachrichten
 * Phase 5: Erweitert um Media-Upload (Image, Audio, Video)
 */

'use client';

import { useState } from 'react';
import { Message, MessageType, Chat } from '@nightlife-os/shared-types';
import { setDocument, updateDocument, getDocument } from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { collection, doc } from 'firebase/firestore';
import { uploadChatMedia } from '../utils/storage';
import { dispatchBulkNotifications } from '../notifications/notification-dispatcher';

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
  sendPoll: (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    question: string,
    options: string[],
    allowMultipleVotes?: boolean,
    expiresAt?: number
  ) => Promise<void>;
  votePoll: (
    clubId: string,
    chatId: string,
    messageId: string,
    userId: string,
    optionIndex: number
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
      // Phase 7: Broadcast-Check - Prüfe ob Sender berechtigt ist
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${chatId}`);
      if (chat?.mode === 'broadcast' && chat.allowedSenders) {
        if (!chat.allowedSenders.includes(senderId)) {
          throw new Error('You are not allowed to send messages in this broadcast chat');
        }
      }
      // Generiere Message-ID
      const db = getFirestoreInstance();
      const messagesRef = collection(db, `clubs/${clubId}/chats/${chatId}/messages`);
      const newMessageRef = doc(messagesRef);
      const messageId = newMessageRef.id;

      const now = Date.now();

      // Upload Media falls vorhanden
      let mediaUrl: string | undefined;
      let mediaType: 'image' | 'voice' | 'video' | undefined;
      let durationSeconds: number | undefined;

      if (imageFile) {
        const result = await uploadChatMedia(clubId, chatId, imageFile, 'image');
        mediaUrl = result.downloadUrl;
        mediaType = 'image';
      } else if (audioFile) {
        const result = await uploadChatMedia(clubId, chatId, audioFile, 'audio');
        mediaUrl = result.downloadUrl;
        mediaType = 'voice';
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
      if (audioFile) messageType = 'voice';
      if (videoFile) messageType = 'video';

      // Erstelle Message
      const newMessage: Message = {
        id: messageId,
        chatId,
        senderId,
        senderName,
        type: messageType,
        text: text || undefined,
        mediaUrl,
        mediaType,
        durationSeconds,
        ephemeralSeconds,
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

      // Phase 7: Dispatch Notifications für alle Empfänger (außer Sender)
      if (chat?.participants) {
        const recipients = chat.participants.filter((uid) => uid !== senderId);
        
        // Bestimme Notification-Type
        let notificationType: 'NEW_DIRECT_MESSAGE' | 'NEW_GROUP_MESSAGE' | 'NEW_BROADCAST_MESSAGE' = 'NEW_DIRECT_MESSAGE';
        if (chat.mode === 'broadcast') {
          notificationType = 'NEW_BROADCAST_MESSAGE';
        } else if (chat.type === 'group') {
          notificationType = 'NEW_GROUP_MESSAGE';
        }

        // Erstelle Notification-Body
        const notificationBody = text || (
          imageFile ? '🖼️ Bild' :
          audioFile ? '🎤 Sprachnachricht' :
          videoFile ? '🎥 Video' :
          'Neue Nachricht'
        );

        // Dispatch Notifications an alle Empfänger
        try {
          await dispatchBulkNotifications(
            recipients,
            notificationType,
            `${senderName}`,
            notificationBody,
            {
              chatId,
              messageId,
              clubId,
            }
          );
        } catch (notifError) {
          console.error('Error dispatching notifications:', notifError);
          // Fehler beim Notification-Dispatch sollte nicht das Message-Senden blockieren
        }
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

  /**
   * Sende Poll (Phase 6)
   */
  const sendPoll = async (
    clubId: string,
    chatId: string,
    senderId: string,
    senderName: string,
    question: string,
    options: string[],
    allowMultipleVotes?: boolean,
    expiresAt?: number
  ): Promise<void> => {
    if (!question?.trim() || !options || options.length < 2) {
      throw new Error('Poll must have a question and at least 2 options');
    }

    setSending(true);

    try {
      // Phase 7: Broadcast-Check - Prüfe ob Sender berechtigt ist
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${chatId}`);
      if (chat?.mode === 'broadcast' && chat.allowedSenders) {
        if (!chat.allowedSenders.includes(senderId)) {
          throw new Error('You are not allowed to send polls in this broadcast chat');
        }
      }
      // Generiere Message-ID
      const db = getFirestoreInstance();
      const messagesRef = collection(db, `clubs/${clubId}/chats/${chatId}/messages`);
      const newMessageRef = doc(messagesRef);
      const messageId = newMessageRef.id;

      const now = Date.now();

      // Erstelle Poll-Message
      const pollMessage: Message = {
        id: messageId,
        chatId,
        senderId,
        senderName,
        type: 'poll',
        poll: {
          question: question.trim(),
          options: options.map((opt) => opt?.trim()).filter((opt) => opt),
          votes: {}, // Initial leer
          allowMultipleVotes: allowMultipleVotes || false,
          expiresAt: expiresAt || undefined
        },
        createdAt: now
      };

      // Speichere Message
      await setDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        pollMessage
      );

      // Aktualisiere Chat lastMessage
      await updateDocument(`clubs/${clubId}/chats/${chatId}`, {
        lastMessageAt: now,
        lastMessagePreview: `📊 ${question.substring(0, 30)}...`
      });

      // Phase 7: Dispatch Notifications für alle Empfänger (außer Sender)
      if (chat?.participants) {
        const recipients = chat.participants.filter((uid) => uid !== senderId);
        
        // Dispatch Notifications an alle Empfänger
        try {
          await dispatchBulkNotifications(
            recipients,
            'NEW_POLL',
            `${senderName}`,
            `📊 ${question}`,
            {
              chatId,
              messageId,
              clubId,
            }
          );
        } catch (notifError) {
          console.error('Error dispatching poll notifications:', notifError);
          // Fehler beim Notification-Dispatch sollte nicht das Poll-Senden blockieren
        }
      }
    } catch (error) {
      console.error('Error sending poll:', error);
      throw error;
    } finally {
      setSending(false);
    }
  };

  /**
   * Vote auf Poll (Phase 6)
   */
  const votePoll = async (
    clubId: string,
    chatId: string,
    messageId: string,
    userId: string,
    optionIndex: number
  ): Promise<void> => {
    try {
      // Hole aktuelle Message
      const { getDocument } = await import('../firebase/firestore');
      const message = await getDocument<Message>(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`
      );

      if (!message || message.type !== 'poll' || !message.poll) {
        throw new Error('Message is not a poll');
      }

      // Prüfe ob Poll abgelaufen
      if (message.poll.expiresAt && Date.now() > message.poll.expiresAt) {
        throw new Error('Poll has expired');
      }

      // Prüfe ob Option existiert
      if (optionIndex < 0 || optionIndex >= message.poll.options.length) {
        throw new Error('Invalid option index');
      }

      // Erstelle neues votes-Objekt
      const newVotes = { ...message.poll.votes };

      // Falls allowMultipleVotes = false: entferne User aus allen anderen Optionen
      if (!message.poll.allowMultipleVotes) {
        Object.keys(newVotes).forEach((key) => {
          const idx = parseInt(key);
          if (idx !== optionIndex) {
            newVotes[idx] = (newVotes[idx] || []).filter((uid) => uid !== userId);
          }
        });
      }

      // Toggle Vote: falls User bereits voted, entferne; sonst füge hinzu
      const currentVotes = newVotes[optionIndex] || [];
      const hasVoted = currentVotes.includes(userId);

      if (hasVoted) {
        newVotes[optionIndex] = currentVotes.filter((uid) => uid !== userId);
      } else {
        newVotes[optionIndex] = [...currentVotes, userId];
      }

      // Update Poll
      await updateDocument(
        `clubs/${clubId}/chats/${chatId}/messages/${messageId}`,
        {
          'poll.votes': newVotes
        }
      );
    } catch (error) {
      console.error('Error voting on poll:', error);
      throw error;
    }
  };

  return {
    sending,
    sendMessage,
    sendPoll,
    votePoll,
    deleteMessage,
    expireMedia
  };
}
