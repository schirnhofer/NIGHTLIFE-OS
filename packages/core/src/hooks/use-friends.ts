/**
 * Friends-Hook
 * 
 * Lädt Freundesliste und Freundschaftsanfragen (Platform-Ebene)
 * Phase 3: Erweitert mit Aktionen
 */

'use client';

import { useState, useEffect } from 'react';
import { Friend, FriendRequest, PlatformUser } from '@nightlife-os/shared-types';
import { onCollectionSnapshot, setDocument, updateDocument, deleteDocument, getDocument } from '../firebase/firestore';

export interface UseFriendsReturn {
  friends: Friend[];
  requests: FriendRequest[];
  loading: boolean;
  sendFriendRequest: (targetCode: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
}

/**
 * Hook für Freundesliste (Platform-Ebene: users/{uid}/friends)
 */
export function useFriends(
  uid: string | null | undefined
): UseFriendsReturn {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFriends([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    // Listener für Freunde
    const unsubscribeFriends = onCollectionSnapshot<Friend>(
      `users/${uid}/friends`,
      (data) => {
        setFriends(data);
      }
    );

    // Listener für Anfragen
    const unsubscribeRequests = onCollectionSnapshot<FriendRequest>(
      `users/${uid}/requests`,
      (data) => {
        setRequests(data);
        setLoading(false);
      }
    );

    // Cleanup
    return () => {
      unsubscribeFriends();
      unsubscribeRequests();
    };
  }, [uid]);

  /**
   * Sende Freundschaftsanfrage via Friend-Code
   */
  const sendFriendRequest = async (targetCode: string, message?: string): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      // 1. Finde Ziel-User via Friend-Code
      // TODO: Implementiere Friend-Code-Suche in Firestore
      // Für jetzt: Platzhalter - simuliere Mock-User
      // In der Praxis: Query users where friendCode == targetCode
      
      // Platzhalter: Mock-User für Demo
      const mockTargetUserId = `mock_user_${targetCode}`;
      
      // 2. Hole eigene User-Daten
      const myUserDoc = await getDocument<PlatformUser>(`users/${uid}`);
      if (!myUserDoc) throw new Error('User data not found');

      // 3. Erstelle Freundschaftsanfrage beim Ziel-User
      const request: FriendRequest = {
        requesterId: uid,
        email: myUserDoc.email,
        displayName: myUserDoc.displayName,
        photoURL: myUserDoc.photoURL,
        friendCode: myUserDoc.friendCode || '',
        message: message,
        status: 'pending',
        createdAt: Date.now()
      };

      await setDocument(`users/${mockTargetUserId}/requests/${uid}`, request);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  };

  /**
   * Akzeptiere Freundschaftsanfrage
   */
  const acceptFriendRequest = async (requestId: string): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      // 1. Hole Request-Daten
      const request = requests.find(r => r.requesterId === requestId);
      if (!request) throw new Error('Request not found');

      // 2. Hole eigene User-Daten
      const myUserDoc = await getDocument<PlatformUser>(`users/${uid}`);
      if (!myUserDoc) throw new Error('User data not found');

      // 3. Erstelle Freundschaft (beide Richtungen)
      const myFriend: Friend = {
        friendId: request.requesterId,
        email: request.email,
        displayName: request.displayName,
        photoURL: request.photoURL,
        friendCode: request.friendCode,
        createdAt: Date.now()
      };

      const theirFriend: Friend = {
        friendId: uid,
        email: myUserDoc.email,
        displayName: myUserDoc.displayName,
        photoURL: myUserDoc.photoURL,
        friendCode: myUserDoc.friendCode || '',
        createdAt: Date.now()
      };

      // Speichere Freundschaft (beide Richtungen)
      await Promise.all([
        setDocument(`users/${uid}/friends/${request.requesterId}`, myFriend),
        setDocument(`users/${request.requesterId}/friends/${uid}`, theirFriend)
      ]);

      // 4. Aktualisiere Request-Status und lösche ihn
      await updateDocument(`users/${uid}/requests/${requestId}`, {
        status: 'accepted'
      });

      // Optional: Lösche Request nach kurzer Zeit
      setTimeout(async () => {
        try {
          await deleteDocument(`users/${uid}/requests/${requestId}`);
        } catch (err) {
          console.error('Error deleting request:', err);
        }
      }, 2000);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  };

  /**
   * Lehne Freundschaftsanfrage ab
   */
  const rejectFriendRequest = async (requestId: string): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      await updateDocument(`users/${uid}/requests/${requestId}`, {
        status: 'rejected'
      });

      // Lösche Request nach kurzer Zeit
      setTimeout(async () => {
        try {
          await deleteDocument(`users/${uid}/requests/${requestId}`);
        } catch (err) {
          console.error('Error deleting request:', err);
        }
      }, 1000);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  };

  /**
   * Entferne Freund (beide Richtungen)
   */
  const removeFriend = async (friendId: string): Promise<void> => {
    if (!uid) throw new Error('Not authenticated');

    try {
      // Lösche Freundschaft (beide Richtungen)
      await Promise.all([
        deleteDocument(`users/${uid}/friends/${friendId}`),
        deleteDocument(`users/${friendId}/friends/${uid}`)
      ]);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  };

  return { 
    friends, 
    requests, 
    loading, 
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
  };
}
