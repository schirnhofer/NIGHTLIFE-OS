/**
 * User-Data-Hook
 * 
 * Lädt User-Daten aus Firestore (platform oder club-spezifisch)
 */

'use client';

import { useState, useEffect } from 'react';
import { PlatformUser, ClubUser } from '@nightlife-os/shared-types';
import { onDocumentSnapshot } from '../firebase/firestore';

export interface UseUserDataReturn<T> {
  userData: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook für Platform-User-Daten
 */
export function usePlatformUserData(
  uid: string | null
): UseUserDataReturn<PlatformUser> {
  const [userData, setUserData] = useState<PlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setUserData(null);
      setLoading(false);
      return;
    }

    // Realtime-Listener für platform/users/{uid}
    const unsubscribe = onDocumentSnapshot<PlatformUser>(
      `platform/users/${uid}`,
      (data) => {
        setUserData(data);
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [uid]);

  return { userData, loading, error };
}

/**
 * Hook für Club-User-Daten
 */
export function useClubUserData(
  clubId: string | null,
  uid: string | null
): UseUserDataReturn<ClubUser> {
  const [userData, setUserData] = useState<ClubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clubId || !uid) {
      setUserData(null);
      setLoading(false);
      return;
    }

    // Realtime-Listener für clubs/{clubId}/users/{uid}
    const unsubscribe = onDocumentSnapshot<ClubUser>(
      `clubs/${clubId}/users/${uid}`,
      (data) => {
        setUserData(data);
        setLoading(false);
      }
    );

    // Cleanup
    return () => unsubscribe();
  }, [clubId, uid]);

  return { userData, loading, error };
}
