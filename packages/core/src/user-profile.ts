/**
 * User Profile Management Functions
 * 
 * CRUD-Funktionen für PlatformUser und ClubUser
 */

import { PlatformUser, ClubUser } from '@nightlife-os/shared-types';
import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  deleteDocument 
} from './firebase/firestore';
import { generateFriendCode } from './utils/friend-code';

/**
 * Erstellt ein neues PlatformUser-Profil
 * @param userId - Die UID des Users
 * @param email - E-Mail-Adresse
 * @param displayName - Display Name (optional)
 * @param role - Initiale Rolle (Standard: 'visitor')
 */
export async function createUserProfile(
  userId: string,
  email: string,
  displayName?: string,
  role: 'visitor' | 'staff' | 'club_admin' | 'super_admin' = 'visitor'
): Promise<PlatformUser> {
  const newProfile: PlatformUser = {
    uid: userId,
    email,
    displayName: displayName || undefined,
    photoURL: undefined,
    friendCode: generateFriendCode(), // Automatisch Friend-Code generieren
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    isPlatformAdmin: role === 'super_admin',
    roles: [role],
    clubs: [],
    pushEnabled: true,
  };

  try {
    await setDocument(`platform/users/${userId}`, newProfile);
    return newProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Fehler beim Erstellen des Benutzerprofils.');
  }
}

/**
 * Ruft ein PlatformUser-Profil ab
 * @param userId - Die UID des Users
 */
export async function getUserProfile(userId: string): Promise<PlatformUser | null> {
  try {
    const profile = await getDocument<PlatformUser>(`platform/users/${userId}`);
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Fehler beim Abrufen des Benutzerprofils.');
  }
}

/**
 * Aktualisiert ein PlatformUser-Profil
 * @param userId - Die UID des Users
 * @param data - Zu aktualisierende Felder
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<PlatformUser>
): Promise<void> {
  try {
    // Aktualisiere lastSeenAt automatisch
    const updateData = {
      ...data,
      lastSeenAt: Date.now(),
    };
    
    await updateDocument(`platform/users/${userId}`, updateData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Fehler beim Aktualisieren des Benutzerprofils.');
  }
}

/**
 * Löscht ein PlatformUser-Profil
 * @param userId - Die UID des Users
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    await deleteDocument(`platform/users/${userId}`);
  } catch (error) {
    console.error('Error deleting user profile:', error);
    throw new Error('Fehler beim Löschen des Benutzerprofils.');
  }
}

/**
 * Erstellt ein ClubUser-Profil für einen User in einem Club
 * @param clubId - Die Club-ID
 * @param userId - Die UID des Users
 * @param platformUser - Das PlatformUser-Profil (optional, wird kopiert)
 */
export async function createClubUserProfile(
  clubId: string,
  userId: string,
  platformUser?: PlatformUser
): Promise<ClubUser> {
  const clubUser: ClubUser = {
    uid: userId,
    email: platformUser?.email || '',
    displayName: platformUser?.displayName || undefined,
    photoURL: platformUser?.photoURL || undefined,
    friendCode: platformUser?.friendCode || generateFriendCode(),
    createdAt: Date.now(),
    lastSeenAt: Date.now(),
    checkedIn: false,
    roles: ['visitor'], // Club-spezifische Rolle
    visitCount: 0,
  };

  try {
    await setDocument(`clubs/${clubId}/users/${userId}`, clubUser);
    return clubUser;
  } catch (error) {
    console.error('Error creating club user profile:', error);
    throw new Error('Fehler beim Erstellen des Club-User-Profils.');
  }
}

/**
 * Ruft ein ClubUser-Profil ab
 * @param clubId - Die Club-ID
 * @param userId - Die UID des Users
 */
export async function getClubUserProfile(
  clubId: string,
  userId: string
): Promise<ClubUser | null> {
  try {
    const profile = await getDocument<ClubUser>(`clubs/${clubId}/users/${userId}`);
    return profile;
  } catch (error) {
    console.error('Error fetching club user profile:', error);
    throw new Error('Fehler beim Abrufen des Club-User-Profils.');
  }
}

/**
 * Aktualisiert ein ClubUser-Profil
 * @param clubId - Die Club-ID
 * @param userId - Die UID des Users
 * @param data - Zu aktualisierende Felder
 */
export async function updateClubUserProfile(
  clubId: string,
  userId: string,
  data: Partial<ClubUser>
): Promise<void> {
  try {
    const updateData = {
      ...data,
      lastSeenAt: Date.now(),
    };
    
    await updateDocument(`clubs/${clubId}/users/${userId}`, updateData);
  } catch (error) {
    console.error('Error updating club user profile:', error);
    throw new Error('Fehler beim Aktualisieren des Club-User-Profils.');
  }
}
