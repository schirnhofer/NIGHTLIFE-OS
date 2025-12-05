/**
 * Check-In/Check-Out-Typen für Nightlife OS
 * Extended in Phase 9 for Shortcode Check-In
 * 
 * Collections:
 * - clubs/{clubId}/checkins/{checkInId}
 */

import { UserProfile } from './user';

/**
 * Check-In-Record
 * Speichert alle Check-Ins/Outs eines Users in einem Club
 */
export interface CheckInRecord {
  id: string; // Eindeutige ID (z.B. userId_timestamp)
  userId: string; // UID des Users
  clubId: string; // ID des Clubs
  checkedInAt: number; // Unix-Timestamp (ms)
  checkedOutAt: number | null; // Unix-Timestamp (ms) oder null wenn noch eingecheckt
  via: 'manual' | 'qr' | 'nfc' | 'auto'; // Wie wurde eingecheckt?
}

/**
 * Check-In-Status für UI
 */
export type CheckInStatus = 'checked_in' | 'checked_out' | 'loading';

/**
 * Check-In-Result für Shortcode-basierte Check-Ins (Phase 9)
 */
export interface CheckInResult {
  success: boolean;
  userProfile?: UserProfile;
  checkInId?: string;
  reason?: 'NOT_FOUND' | 'ALREADY_CHECKED_IN' | 'ERROR';
  message?: string;
}
