/**
 * Check-In Hook
 * 
 * Verwaltet Check-In/Check-Out für einen User in einem Club
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckInRecord } from '@nightlife-os/shared-types';
import { 
  setDocument, 
  updateDocument, 
  getCollection,
  where,
  orderBy,
  limit as firestoreLimit,
} from '../firebase/firestore';

export type CheckInStatus = 'checked_in' | 'checked_out' | 'loading';

export interface UseCheckInReturn {
  checkIn: () => Promise<void>;
  checkOut: () => Promise<void>;
  currentStatus: CheckInStatus;
  loading: boolean;
  error: Error | null;
  currentRecord: CheckInRecord | null;
}

/**
 * Hook für Check-In/Check-Out-Verwaltung
 */
export function useCheckIn(
  clubId: string,
  userId?: string | null
): UseCheckInReturn {
  const [currentStatus, setCurrentStatus] = useState<CheckInStatus>('loading');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentRecord, setCurrentRecord] = useState<CheckInRecord | null>(null);

  // Status prüfen beim Mount und bei Änderungen
  useEffect(() => {
    if (!userId || !clubId) {
      setCurrentStatus('checked_out');
      return;
    }

    // Aktuellen Check-In-Status aus Firestore laden
    const loadStatus = async () => {
      try {
        const records = await getCollection<CheckInRecord>(
          `clubs/${clubId}/checkins`,
          [
            where('userId', '==', userId),
            where('checkedOutAt', '==', null),
            orderBy('checkedInAt', 'desc'),
            firestoreLimit(1)
          ]
        );

        if (records && records.length > 0) {
          setCurrentStatus('checked_in');
          setCurrentRecord(records[0]);
        } else {
          setCurrentStatus('checked_out');
          setCurrentRecord(null);
        }
      } catch (err) {
        console.error('Error loading check-in status:', err);
        setError(err as Error);
        setCurrentStatus('checked_out');
      }
    };

    loadStatus();
  }, [clubId, userId]);

  // Check-In
  const checkIn = useCallback(async () => {
    if (!userId || !clubId) {
      throw new Error('User ID and Club ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      // Neuen Check-In-Record erstellen
      const recordId = `${userId}_${Date.now()}`;
      const newRecord: CheckInRecord = {
        id: recordId,
        userId,
        clubId,
        checkedInAt: Date.now(),
        checkedOutAt: null,
        via: 'manual',
      };

      await setDocument(`clubs/${clubId}/checkins/${recordId}`, newRecord);

      // Club-User-Status aktualisieren
      await updateDocument(`clubs/${clubId}/users/${userId}`, {
        checkedIn: true,
        checkedInAt: Date.now(),
        lastSeen: Date.now(),
      });

      setCurrentStatus('checked_in');
      setCurrentRecord(newRecord);
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clubId, userId]);

  // Check-Out
  const checkOut = useCallback(async () => {
    if (!userId || !clubId) {
      throw new Error('User ID and Club ID are required');
    }

    if (!currentRecord) {
      throw new Error('No active check-in found');
    }

    setLoading(true);
    setError(null);

    try {
      // Check-In-Record aktualisieren
      await updateDocument(`clubs/${clubId}/checkins/${currentRecord.id}`, {
        checkedOutAt: Date.now(),
      });

      // Club-User-Status aktualisieren
      await updateDocument(`clubs/${clubId}/users/${userId}`, {
        checkedIn: false,
        checkedInAt: null,
        lastSeen: Date.now(),
      });

      setCurrentStatus('checked_out');
      setCurrentRecord(null);
    } catch (err) {
      console.error('Check-out error:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clubId, userId, currentRecord]);

  return {
    checkIn,
    checkOut,
    currentStatus,
    loading,
    error,
    currentRecord,
  };
}
