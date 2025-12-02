/**
 * User Types for Nightlife OS
 * Extended in Phase 2 for Friend System
 * Extended in Phase 7 for Roles, Language & Multi-Club
 * Extended in Phase 8 for Push Notifications (FCM)
 */

/**
 * Platform-weite Rollen (Phase 7)
 */
export type PlatformRole = 'super_admin' | 'club_admin' | 'staff' | 'visitor';

/**
 * PlatformUser: Globaler User-Account
 * Firestore: platform/users/{uid}
 */
export interface PlatformUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  friendCode?: string;              // 7-stelliger alphanumerischer Code
  createdAt: number;
  lastSeenAt?: number;
  isPlatformAdmin?: boolean;        // Legacy: für Super-Admin
  
  // Phase 7 Extensions
  language?: string;                // Bevorzugte Sprache (ISO 639-1: 'de', 'en', 'es', etc.)
  roles: PlatformRole[];            // Rollen des Users
  clubs?: string[];                 // Club-IDs, denen der User angehört
  
  // Phase 8 Extensions: Push Notifications (FCM)
  fcmTokens?: string[];             // Array von FCM-Tokens für verschiedene Geräte
  pushEnabled?: boolean;            // true, wenn Push-Nachrichten aktiviert sind (Standard: true)
  
  // Freundes-System
  ownedClubs?: string[];            // Club-IDs die dieser User besitzt
  memberClubs?: string[];           // Club-IDs in denen User Mitglied ist
}

/**
 * ClubUser: Club-spezifische User-Daten
 * Firestore: clubs/{clubId}/users/{uid}
 */
export interface ClubUser extends Omit<PlatformUser, 'roles'> {
  roles?: string[];                 // Club-spezifische Rollen (überschreibt PlatformUser.roles)
  checkedIn?: boolean;
  language?: string;                // Bevorzugte Sprache für diesen Club
  friendCode?: string;
  friendIds?: string[];
  
  // Trust-Score Faktoren
  phoneVerified?: boolean;
  deviceIdHash?: string;
  faceHash?: string;
  visitCount?: number;
  staffVerified?: boolean;
}

/**
 * UserProfile: Minimale User-Info für UI
 */
export interface UserProfile {
  uid: string;
  displayName?: string;
  photoURL?: string;
  friendCode?: string;
}
