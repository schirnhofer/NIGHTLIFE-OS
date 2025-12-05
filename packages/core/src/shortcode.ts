/**
 * Shortcode-System für Nightlife OS (Phase 9)
 * 
 * Format: "WORT 1234"
 * - WORT: 4 Buchstaben aus wordList
 * - 1234: 4 Ziffern (0000-9999)
 * 
 * Funktionen:
 * - generateShortCodeSuggestions(): Generiert 5 freie Shortcode-Vorschläge
 * - reserveShortCodeForUser(): Reserviert Shortcode in Firestore-Transaktion
 * - findUserByShortCode(): Sucht User anhand Shortcode
 * - checkInByShortCode(): Check-In via Shortcode
 */

import { 
  getCollection, 
  updateDocument,
  where 
} from './firebase/firestore';
import { 
  WORD_LIST, 
  SHORTCODE_NUMBER_MIN, 
  SHORTCODE_NUMBER_MAX 
} from './utils/wordList';
import { 
  PlatformUser, 
  UserProfile, 
  CheckInResult
} from '@nightlife-os/shared-types';
import { createCheckIn, getCurrentCheckIn } from './check-in';

/**
 * Shortcode-Vorschläge-Ergebnis
 */
export interface ShortCodeSuggestions {
  options: string[];
  number: string;
}

/**
 * Generiert eine zufällige 4-stellige Zahl als String
 */
function generateRandomNumber(): string {
  const num = Math.floor(
    Math.random() * (SHORTCODE_NUMBER_MAX - SHORTCODE_NUMBER_MIN + 1)
  ) + SHORTCODE_NUMBER_MIN;
  return num.toString().padStart(4, '0');
}

/**
 * Wählt n zufällige, unterschiedliche Wörter aus der wordList
 */
function selectRandomWords(count: number): string[] {
  const shuffled = [...WORD_LIST].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Normalisiert einen Shortcode:
 * - Trim
 * - Uppercase
 * - Mehrfach-Leerzeichen reduzieren auf ein Leerzeichen
 */
export function normalizeShortCode(shortCode: string): string {
  return shortCode
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

/**
 * Prüft, ob ein Shortcode bereits vergeben ist
 */
async function isShortCodeAvailable(shortCode: string): Promise<boolean> {
  const normalizedCode = normalizeShortCode(shortCode);
  
  const existingUsers = await getCollection<PlatformUser>(
    'platform/users',
    [where('shortCode', '==', normalizedCode)]
  );
  
  return existingUsers.length === 0;
}

/**
 * Generiert 5 freie Shortcode-Vorschläge
 * 
 * @returns Promise mit 5 freien Shortcodes und der gemeinsamen Zahl
 * @throws Error wenn nach mehreren Versuchen keine 5 freien Codes gefunden werden
 */
export async function generateShortCodeSuggestions(): Promise<ShortCodeSuggestions> {
  const maxAttempts = 50; // Sicherheits-Limit
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    attempts++;
    
    // Generiere eine Zahl und wähle 5 Wörter
    const number = generateRandomNumber();
    const words = selectRandomWords(5);
    
    // Erstelle Shortcodes
    const candidates = words.map(word => `${word} ${number}`);
    
    // Prüfe Verfügbarkeit aller Kandidaten
    const availabilityChecks = await Promise.all(
      candidates.map(code => isShortCodeAvailable(code))
    );
    
    // Filtere nur freie Codes
    const freeOptions = candidates.filter((_, index) => availabilityChecks[index]);
    
    // Wenn mindestens 5 freie Codes gefunden, sind wir fertig
    if (freeOptions.length >= 5) {
      return {
        options: freeOptions.slice(0, 5),
        number
      };
    }
    
    // Sonst: neuer Versuch mit neuer Zahl und neuen Wörtern
  }
  
  throw new Error(
    'Could not generate 5 free shortcode suggestions after ' + 
    maxAttempts + 
    ' attempts. Please try again.'
  );
}

/**
 * Reserviert einen Shortcode für einen User
 * 
 * @param userId - Firebase Auth UID
 * @param shortCode - Gewählter Shortcode im Format "WORT 1234"
 * @throws Error wenn Shortcode nicht mehr verfügbar (Race-Condition)
 */
export async function reserveShortCodeForUser(
  userId: string, 
  shortCode: string
): Promise<void> {
  const normalizedCode = normalizeShortCode(shortCode);
  
  // Prüfe zuerst, ob der Code noch frei ist
  const isAvailable = await isShortCodeAvailable(normalizedCode);
  
  if (!isAvailable) {
    throw new Error('SHORTCODE_TAKEN: This shortcode is no longer available.');
  }
  
  // Shortcode dem User zuweisen
  await updateDocument(`platform/users/${userId}`, {
    shortCode: normalizedCode,
    lastSeenAt: Date.now()
  });
}

/**
 * Sucht einen User anhand seines Shortcodes
 * 
 * @param shortCode - Shortcode im Format "WORT 1234"
 * @returns UserProfile oder null wenn nicht gefunden
 */
export async function findUserByShortCode(
  shortCode: string
): Promise<UserProfile | null> {
  const normalizedCode = normalizeShortCode(shortCode);
  
  const users = await getCollection<PlatformUser>(
    'platform/users',
    [where('shortCode', '==', normalizedCode)]
  );
  
  if (users.length === 0) {
    return null;
  }
  
  // Ersten (und einzigen) User zurückgeben
  const userData = users[0];
  
  return {
    uid: userData.uid,
    displayName: userData.displayName,
    photoURL: userData.photoURL,
    friendCode: userData.friendCode,
    shortCode: userData.shortCode
  };
}

/**
 * Check-In via Shortcode (QR oder manuell)
 * 
 * @param shortCode - Shortcode des Users
 * @param clubId - ID des Clubs
 * @param source - 'qr' oder 'manual'
 * @returns CheckInResult mit Erfolg/Fehler-Info
 */
export async function checkInByShortCode(
  shortCode: string,
  clubId: string,
  source: 'qr' | 'manual'
): Promise<CheckInResult> {
  try {
    // 1. User anhand Shortcode finden
    const userProfile = await findUserByShortCode(shortCode);
    
    if (!userProfile) {
      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'Kein User mit diesem Shortcode gefunden.'
      };
    }
    
    const userId = userProfile.uid;
    
    // 2. Prüfe, ob User bereits eingecheckt ist
    const existingCheckIn = await getCurrentCheckIn(userId, clubId);
    
    if (existingCheckIn) {
      return {
        success: false,
        reason: 'ALREADY_CHECKED_IN',
        message: 'User ist bereits eingecheckt.',
        userProfile
      };
    }
    
    // 3. Neuen Check-In erstellen (nutzt bestehende Funktion)
    const checkInRecord = await createCheckIn(userId, clubId, source);
    
    return {
      success: true,
      userProfile,
      checkInId: checkInRecord.id,
      message: 'Check-In erfolgreich.'
    };
    
  } catch (error) {
    console.error('Error in checkInByShortCode:', error);
    return {
      success: false,
      reason: 'ERROR',
      message: error instanceof Error ? error.message : 'Unbekannter Fehler'
    };
  }
}

/**
 * Generiert einen QR-Code-String aus einem Shortcode
 * 
 * @param shortCode - Shortcode im Format "WORT 1234"
 * @returns QR-Code-Daten (einfach der Shortcode selbst)
 */
export function generateShortCodeQR(shortCode: string): string {
  return normalizeShortCode(shortCode);
}
