/**
 * Friends-Hook
 * 
 * Lädt Freundesliste und Freundschaftsanfragen
 * Platzhalter für Phase 2
 */

'use client';

import { useState, useEffect } from 'react';
import { Friendship, FriendRequest } from '@nightlife-os/shared-types';
import { onCollectionSnapshot } from '../firebase/firestore';

export interface UseFriendsReturn {
  friends: Friendship[];
  requests: FriendRequest[];
  loading: boolean;
}

/**
 * Hook für Freundesliste
 */
export function useFriends(
  clubId: string | null,
  uid: string | null
): UseFriendsReturn {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId || !uid) {
      setFriends([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    // Listener für Freunde
    const unsubscribeFriends = onCollectionSnapshot<Friendship>(
      `clubs/${clubId}/users/${uid}/friends`,
      (data) => {
        setFriends(data);
      }
    );

    // Listener für Anfragen
    const unsubscribeRequests = onCollectionSnapshot<FriendRequest>(
      `clubs/${clubId}/users/${uid}/requests`,
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
  }, [clubId, uid]);

  return { friends, requests, loading };
}
