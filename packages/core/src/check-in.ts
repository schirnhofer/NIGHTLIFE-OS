/**
 * Check-In Management Functions
 * 
 * CRUD-Funktionen für Check-In/Check-Out System
 */

import { CheckInRecord } from '@nightlife-os/shared-types';
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  getCollection,
  where,
  orderBy,
  limit as firestoreLimit,
} from './firebase/firestore';

/**
 * Erstellt einen neuen Check-In
 * @param userId - Die UID des Users
 * @param clubId - Die Club-ID
 * @param via - Check-In-Methode (Standard: 'manual')
 */
export async function createCheckIn(
  userId: string,
  clubId: string,
  via: 'manual' | 'qr' | 'nfc' | 'auto' = 'manual'
): Promise<CheckInRecord> {
  const recordId = `${userId}_${Date.now()}`;
  const newCheckIn: CheckInRecord = {
    id: recordId,
    userId,
    clubId,
    checkedInAt: Date.now(), // Automatisches Setzen von timestamp
    checkedOutAt: null,
    via,
  };

  try {
    await setDocument(`clubs/${clubId}/checkins/${recordId}`, newCheckIn);
    
    // Optional: Club-User-Status aktualisieren
    await updateDocument(`clubs/${clubId}/users/${userId}`, {
      checkedIn: true,
      lastSeenAt: Date.now(),
    }).catch(err => {
      console.warn('Could not update club user status:', err);
    });
    
    return newCheckIn;
  } catch (error) {
    console.error('Error creating check-in:', error);
    throw new Error('Fehler beim Erstellen des Check-Ins.');
  }
}

/**
 * Ruft alle Check-Ins eines Users ab
 * @param userId - Die UID des Users
 * @param clubId - Optional: Filtere nach Club-ID
 * @param limitCount - Optional: Begrenze Anzahl der Ergebnisse
 */
export async function getCheckInsByUser(
  userId: string,
  clubId?: string,
  limitCount?: number
): Promise<CheckInRecord[]> {
  try {
    const constraints: any[] = [
      where('userId', '==', userId),
      orderBy('checkedInAt', 'desc'),
    ];
    
    if (clubId) {
      constraints.unshift(where('clubId', '==', clubId));
    }
    
    if (limitCount) {
      constraints.push(firestoreLimit(limitCount));
    }
    
    // Wenn clubId angegeben ist, nutze die Collection des Clubs
    const collectionPath = clubId 
      ? `clubs/${clubId}/checkins` 
      : 'checkins'; // Fallback (sollte eigentlich nicht verwendet werden)
    
    const checkIns = await getCollection<CheckInRecord>(
      collectionPath,
      constraints
    );
    
    return checkIns || [];
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    throw new Error('Fehler beim Abrufen der Check-Ins.');
  }
}

/**
 * Aktualisiert den Status eines Check-Ins (Check-Out)
 * @param clubId - Die Club-ID
 * @param checkInId - Die Check-In-ID
 * @param status - Neuer Status ('checked-out')
 */
export async function updateCheckInStatus(
  clubId: string,
  checkInId: string,
  status: 'checked-out'
): Promise<void> {
  try {
    // Hole den aktuellen Check-In
    const checkIn = await getDocument<CheckInRecord>(
      `clubs/${clubId}/checkins/${checkInId}`
    );
    
    if (!checkIn) {
      throw new Error('Check-In nicht gefunden.');
    }
    
    if (status === 'checked-out') {
      // Setze checkedOutAt
      await updateDocument(`clubs/${clubId}/checkins/${checkInId}`, {
        checkedOutAt: Date.now(),
      });
      
      // Optional: Club-User-Status aktualisieren
      await updateDocument(`clubs/${clubId}/users/${checkIn.userId}`, {
        checkedIn: false,
        lastSeenAt: Date.now(),
      }).catch(err => {
        console.warn('Could not update club user status:', err);
      });
    }
  } catch (error) {
    console.error('Error updating check-in status:', error);
    throw new Error('Fehler beim Aktualisieren des Check-In-Status.');
  }
}

/**
 * Holt den aktuellen aktiven Check-In eines Users in einem Club
 * @param userId - Die UID des Users
 * @param clubId - Die Club-ID
 */
export async function getCurrentCheckIn(
  userId: string,
  clubId: string
): Promise<CheckInRecord | null> {
  try {
    const checkIns = await getCollection<CheckInRecord>(
      `clubs/${clubId}/checkins`,
      [
        where('userId', '==', userId),
        where('checkedOutAt', '==', null),
        orderBy('checkedInAt', 'desc'),
        firestoreLimit(1),
      ]
    );
    
    return checkIns && checkIns.length > 0 ? checkIns[0] : null;
  } catch (error) {
    console.error('Error fetching current check-in:', error);
    throw new Error('Fehler beim Abrufen des aktuellen Check-Ins.');
  }
}

/**
 * Check-Out für einen User
 * @param userId - Die UID des Users
 * @param clubId - Die Club-ID
 */
export async function checkOutUser(
  userId: string,
  clubId: string
): Promise<void> {
  try {
    // Hole den aktuellen Check-In
    const currentCheckIn = await getCurrentCheckIn(userId, clubId);
    
    if (!currentCheckIn) {
      throw new Error('Kein aktiver Check-In gefunden.');
    }
    
    // Aktualisiere den Status
    await updateCheckInStatus(clubId, currentCheckIn.id, 'checked-out');
  } catch (error) {
    console.error('Error checking out user:', error);
    throw new Error('Fehler beim Check-Out.');
  }
}
