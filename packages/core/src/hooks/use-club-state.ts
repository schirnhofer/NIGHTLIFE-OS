/**
 * Club-State-Hook
 * 
 * Lädt den globalen Club-State (clubs/{clubId}/state/global)
 * Für Realtime-Features wie Lichtshow, Countdown, etc.
 */

'use client';

import { useState, useEffect } from 'react';
import { ClubState } from '@nightlife-os/shared-types';
import { onDocumentSnapshot } from '../firebase/firestore';

export interface UseClubStateReturn {
  clubState: ClubState | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook für globalen Club-State
 */
export function useClubState(clubId: string | null): UseClubStateReturn {
  const [clubState, setClubState] = useState<ClubState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!clubId) {
      setClubState(null);
      setLoading(false);
      return;
    }

    try {
      // Realtime-Listener für clubs/{clubId}/state/global
      const unsubscribe = onDocumentSnapshot<ClubState>(
        `clubs/${clubId}/state/global`,
        (data) => {
          setClubState(data);
          setLoading(false);
          setError(null);
        }
      );

      // Cleanup
      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [clubId]);

  return { clubState, loading, error };
}
