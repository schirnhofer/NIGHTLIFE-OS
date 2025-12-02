/**
 * User-Data Hooks
 * 
 * Hooks zum Abrufen und Verwalten von User-Daten aus Firestore
 */

'use client';

import { useState, useEffect } from 'react';
import { PlatformUser, ClubUser } from '@nightlife-os/shared-types';
import { onDocumentSnapshot, setDocument, updateDocument } from '../firebase/firestore';
import { generateFriendCode } from '../utils/friend-code';

export interface UsePlatformUserDataReturn {
  user: PlatformUser | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => void;
  generateNewFriendCode: () => Promise<void>;
}

/**
 * Hook für Platform-User-Daten (platform/users/{uid})
 */
export function usePlatformUserData(uid?: string | null): UsePlatformUserDataReturn {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!uid) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Firestore Realtime-Listener
    const unsubscribe = onDocumentSnapshot(
      `platform/users/${uid}`,
      (docSnapshot) => {
        if (docSnapshot) {
          const data = docSnapshot as PlatformUser;
          setUser(data);
          
          // lastSeenAt aktualisieren
          updateDocument(`platform/users/${uid}`, {
            lastSeenAt: Date.now(),
          }).catch(console.error);
        } else {
          // Dokument existiert nicht - erstellen
          const newUser: PlatformUser = {
            uid,
            email: '',
            displayName: null,
            photoURL: null,
            createdAt: Date.now(),
            lastSeenAt: Date.now(),
            isPlatformAdmin: false,
            ownedClubs: [],
            memberClubs: [],
          };
          setDocument(`platform/users/${uid}`, newUser)
            .then(() => setUser(newUser))
            .catch((err) => {
              console.error('Error creating platform user:', err);
              setError(err as Error);
            });
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, refreshTrigger]);

  // Friend-Code generieren
  const generateNewFriendCode = async () => {
    if (!uid) return;
    
    try {
      const newCode = generateFriendCode();
      await updateDocument(`platform/users/${uid}`, {
        friendCode: newCode,
      });
    } catch (err) {
      console.error('Error generating friend code:', err);
      throw err;
    }
  };

  // Manuelles Refresh
  const refreshUser = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return {
    user,
    loading,
    error,
    refreshUser,
    generateNewFriendCode,
  };
}

export interface UseClubUserDataReturn {
  user: ClubUser | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook für Club-User-Daten (clubs/{clubId}/users/{uid})
 */
export function useClubUserData(
  clubId?: string | null,
  uid?: string | null
): UseClubUserDataReturn {
  const [user, setUser] = useState<ClubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clubId || !uid) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Firestore Realtime-Listener
    const unsubscribe = onDocumentSnapshot(
      `clubs/${clubId}/users/${uid}`,
      (docSnapshot) => {
        if (docSnapshot) {
          const data = docSnapshot as ClubUser;
          setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clubId, uid]);

  return {
    user,
    loading,
    error,
  };
}
