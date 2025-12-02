/**
 * Chats-Hook
 * 
 * Lädt Chatliste und Messages (Club-Ebene)
 * Phase 3: Erweitert mit Gruppen-Verwaltung
 */

'use client';

import { useState, useEffect } from 'react';
import { Chat, Message } from '@nightlife-os/shared-types';
import { 
  onCollectionSnapshot, 
  where, 
  setDocument, 
  updateDocument, 
  deleteDocument,
  getDocument 
} from '../firebase/firestore';
import { getFirestoreInstance } from '../firebase/init';
import { collection, doc } from 'firebase/firestore';

export interface UseChatsReturn {
  chats: Chat[];
  loading: boolean;
  createPrivateChat: (clubId: string, otherUserId: string, otherUserName: string) => Promise<string>;
  createGroupChat: (clubId: string, name: string, memberIds: string[], creatorId: string) => Promise<string>;
  addToGroup: (clubId: string, groupId: string, userId: string) => Promise<void>;
  removeFromGroup: (clubId: string, groupId: string, userId: string) => Promise<void>;
  leaveGroup: (clubId: string, groupId: string, userId: string) => Promise<void>;
  deleteGroup: (clubId: string, groupId: string, creatorId: string) => Promise<void>;
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
        // Filtere Chats nach participants und sortiere nach lastMessageAt
        const myChats = data
          .filter(chat => chat.participants?.includes(uid))
          .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
        setChats(myChats);
        setLoading(false);
      },
      [where('participants', 'array-contains', uid)]
    );

    // Cleanup
    return () => unsubscribe();
  }, [clubId, uid]);

  /**
   * Erstellt oder findet einen privaten Chat (1:1)
   * ChatID = [uid1, uid2].sort().join('_')
   */
  const createPrivateChat = async (
    clubId: string, 
    otherUserId: string,
    _otherUserName: string
  ): Promise<string> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      // Generiere Chat-ID (alphabetisch sortiert)
      const chatId = [uid, otherUserId].sort().join('_');

      // Prüfe, ob Chat bereits existiert
      const existingChat = await getDocument<Chat>(`clubs/${clubId}/chats/${chatId}`);
      if (existingChat) {
        return chatId; // Chat existiert bereits
      }

      // Erstelle neuen privaten Chat
      const newChat: Chat = {
        chatId,
        type: 'private',
        participants: [uid, otherUserId],
        lastMessageAt: Date.now(),
        lastMessagePreview: '',
        createdAt: Date.now()
      };

      await setDocument(`clubs/${clubId}/chats/${chatId}`, newChat);
      return chatId;
    } catch (error) {
      console.error('Error creating private chat:', error);
      throw error;
    }
  };

  /**
   * Erstellt einen neuen Gruppen-Chat
   */
  const createGroupChat = async (
    clubId: string,
    name: string,
    memberIds: string[],
    creatorId: string
  ): Promise<string> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      // Generiere neue Chat-ID
      const db = getFirestoreInstance();
      const chatsRef = collection(db, `clubs/${clubId}/chats`);
      const newChatRef = doc(chatsRef);
      const chatId = newChatRef.id;

      // Erstelle Gruppen-Chat
      const newChat: Chat = {
        chatId,
        type: 'group',
        name,
        createdBy: creatorId,
        participants: [creatorId, ...memberIds.filter(id => id !== creatorId)],
        lastMessageAt: Date.now(),
        lastMessagePreview: '',
        createdAt: Date.now()
      };

      await setDocument(`clubs/${clubId}/chats/${chatId}`, newChat);
      return chatId;
    } catch (error) {
      console.error('Error creating group chat:', error);
      throw error;
    }
  };

  /**
   * Füge Mitglied zu Gruppe hinzu
   */
  const addToGroup = async (
    clubId: string,
    groupId: string,
    userId: string
  ): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${groupId}`);
      if (!chat || chat.type !== 'group') {
        throw new Error('Group not found');
      }

      // Prüfe, ob User bereits Mitglied ist
      if (chat.participants.includes(userId)) {
        return; // Bereits Mitglied
      }

      // Füge User hinzu
      await updateDocument(`clubs/${clubId}/chats/${groupId}`, {
        participants: [...chat.participants, userId]
      });
    } catch (error) {
      console.error('Error adding to group:', error);
      throw error;
    }
  };

  /**
   * Entferne Mitglied aus Gruppe (nur Creator)
   */
  const removeFromGroup = async (
    clubId: string,
    groupId: string,
    userId: string
  ): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${groupId}`);
      if (!chat || chat.type !== 'group') {
        throw new Error('Group not found');
      }

      // Prüfe, ob aktueller User Creator ist
      if (chat.createdBy !== uid) {
        throw new Error('Only creator can remove members');
      }

      // Entferne User
      await updateDocument(`clubs/${clubId}/chats/${groupId}`, {
        participants: chat.participants.filter(id => id !== userId)
      });
    } catch (error) {
      console.error('Error removing from group:', error);
      throw error;
    }
  };

  /**
   * Verlasse Gruppe
   */
  const leaveGroup = async (
    clubId: string,
    groupId: string,
    userId: string
  ): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${groupId}`);
      if (!chat || chat.type !== 'group') {
        throw new Error('Group not found');
      }

      // Entferne User aus participants
      const newParticipants = chat.participants.filter(id => id !== userId);

      if (newParticipants.length === 0) {
        // Letzer User verlässt - lösche Gruppe
        await deleteDocument(`clubs/${clubId}/chats/${groupId}`);
      } else {
        await updateDocument(`clubs/${clubId}/chats/${groupId}`, {
          participants: newParticipants
        });
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  };

  /**
   * Lösche Gruppe (nur Creator)
   */
  const deleteGroup = async (
    clubId: string,
    groupId: string,
    creatorId: string
  ): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      const chat = await getDocument<Chat>(`clubs/${clubId}/chats/${groupId}`);
      if (!chat || chat.type !== 'group') {
        throw new Error('Group not found');
      }

      // Prüfe, ob aktueller User Creator ist
      if (chat.createdBy !== creatorId) {
        throw new Error('Only creator can delete group');
      }

      // Lösche Gruppe
      await deleteDocument(`clubs/${clubId}/chats/${groupId}`);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  return { 
    chats, 
    loading,
    createPrivateChat,
    createGroupChat,
    addToGroup,
    removeFromGroup,
    leaveGroup,
    deleteGroup
  };
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

    // Listener für Messages (sortiert nach createdAt)
    const unsubscribe = onCollectionSnapshot<Message>(
      `clubs/${clubId}/chats/${chatId}/messages`,
      (data) => {
        // Sortiere nach createdAt aufsteigend (alt -> neu)
        const sortedMessages = data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setMessages(sortedMessages);
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [clubId, chatId]);

  return { messages, loading };
}

/**
 * Erstellt einen Super-Admin Broadcast-Chat (global)
 * Phase 7: Nur Super-Admins dürfen hier senden
 * 
 * @param clubId - Club-ID für Chat-Speicherort
 * @param superAdminUid - UID des Super-Admins
 * @param allUserIds - Array aller User-IDs (participants)
 * @returns Chat-ID des Broadcast-Chats
 */
export async function createSuperAdminBroadcastChat(
  clubId: string,
  superAdminUid: string,
  allUserIds: string[]
): Promise<string> {
  try {
    const chatId = `broadcast_global_${Date.now()}`;
    
    const broadcastChat: Chat = {
      id: chatId,
      clubId,
      type: 'group',
      name: 'Nightlife News',
      participants: allUserIds,
      creatorId: superAdminUid,
      createdAt: Date.now(),
      mode: 'broadcast',
      broadcastScope: 'global',
      allowedSenders: [superAdminUid],
      allowReactions: true,
    };

    await setDocument(`clubs/${clubId}/chats/${chatId}`, broadcastChat);
    return chatId;
  } catch (error) {
    console.error('Error creating super admin broadcast chat:', error);
    throw error;
  }
}

/**
 * Erstellt einen Club-Admin Broadcast-Chat
 * Phase 7: Nur Club-Admins dürfen hier senden
 * 
 * @param clubId - Club-ID
 * @param adminUid - UID des Club-Admins
 * @param clubUserIds - Array aller User-IDs dieses Clubs
 * @returns Chat-ID des Broadcast-Chats
 */
export async function createClubBroadcastChat(
  clubId: string,
  adminUid: string,
  clubUserIds: string[]
): Promise<string> {
  try {
    const chatId = `broadcast_club_${clubId}_${Date.now()}`;
    
    const broadcastChat: Chat = {
      id: chatId,
      clubId,
      type: 'group',
      name: 'Club News',
      participants: clubUserIds,
      creatorId: adminUid,
      createdAt: Date.now(),
      mode: 'broadcast',
      broadcastScope: 'club',
      allowedSenders: [adminUid],
      allowReactions: true,
    };

    await setDocument(`clubs/${clubId}/chats/${chatId}`, broadcastChat);
    return chatId;
  } catch (error) {
    console.error('Error creating club broadcast chat:', error);
    throw error;
  }
}
