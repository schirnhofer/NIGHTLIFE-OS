/**
 * User-Typen für Nightlife OS
 * 
 * Zweistufiges User-Modell:
 * 1. PlatformUser - Plattformweiter Account (platform/users/{uid})
 * 2. ClubUser - Club-spezifische Daten (clubs/{clubId}/users/{uid})
 */

// ===== PLATTFORM-EBENE =====

/**
 * Globaler User-Account (platform/users/{uid})
 * Wird bei der ersten Registrierung angelegt
 */
export interface PlatformUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  friendCode?: string; // 7-stelliger Code (z.B. "ABXY489")
  createdAt: number; // Unix-Timestamp (ms)
  lastSeenAt: number;
  isPlatformAdmin: boolean; // Super-Admin?
  ownedClubs: string[]; // IDs der Clubs, die dieser User besitzt
  memberClubs: string[]; // IDs der Clubs, in denen User Mitglied ist
}

// ===== CLUB-EBENE =====

/**
 * User im Kontext eines spezifischen Clubs (clubs/{clubId}/users/{uid})
 * Enthält club-spezifische Daten wie Rolle, Check-In, Trust-Level
 */
export interface ClubUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  
  // Rollen & Berechtigungen
  roles: string[]; // z.B. ["guest"], ["staff", "door"], ["admin"]
  
  // Check-In/Out
  checkedIn: boolean;
  checkedInAt: number | null; // Unix-Timestamp (ms)
  lastSeen: number;
  
  // Sprache
  language: string; // "de", "en", "fr", etc.
  
  // Freundschafts-System
  friendCode: string; // 7-stelliger Code (z.B. "ABXY489")
  friendIds: string[]; // Denormalisiert für schnelle Queries
  
  // Trust-System
  phoneNumber: string | null;
  phoneVerified: boolean;
  deviceIdHash: string | null; // SHA-256 Hash der Device-ID
  faceHash: string | null; // Hash des Gesichts (FaceID)
  trustedLevel: number; // 0-100
  verifiedBy: string | null; // UID des Staff, der verifiziert hat
  verifiedAt: number | null;
  blacklisted: boolean;
  blacklistReason: string | null;
  
  // Historie
  visitCount: number;
  lastVisits: number[]; // Timestamps der letzten 10 Besuche
}

/**
 * Minimale User-Info für UI-Anzeige
 */
export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  checkedIn?: boolean;
}
