/**
 * Friend-Code-Generator
 * 
 * Generiert 7-stellige alphanumerische Codes für Freundschafts-System
 * Format: ABXY489 (Großbuchstaben + Zahlen, keine Verwechslungsgefahr)
 */

import { PlatformUser } from '@nightlife-os/shared-types';
import { getCollection, where } from '../firebase/firestore';

// Zeichen ohne Verwechslungsgefahr (ohne 0, O, I, 1, etc.)
const ALLOWED_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 7;

/**
 * Generiert einen zufälligen Friend-Code
 */
export function generateFriendCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length);
    code += ALLOWED_CHARS[randomIndex];
  }
  return code;
}

/**
 * Validiert einen Friend-Code
 */
export function validateFriendCode(code: string): boolean {
  if (code.length !== CODE_LENGTH) {
    return false;
  }

  // Prüfe, ob nur erlaubte Zeichen verwendet werden
  for (let i = 0; i < code.length; i++) {
    if (!ALLOWED_CHARS.includes(code[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Formatiert einen Friend-Code (Großbuchstaben)
 */
export function formatFriendCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Generiert einen eindeutigen Friend-Code
 * Prüft in Firestore, ob der Code bereits existiert
 * @param maxAttempts - Maximale Anzahl von Versuchen (Standard: 10)
 */
export async function generateUniqueFriendCode(maxAttempts: number = 10): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const code = generateFriendCode();
    
    // Prüfe, ob der Code bereits existiert
    const existingUsers = await getCollection<PlatformUser>(
      'platform/users',
      [where('friendCode', '==', code)]
    );
    
    if (!existingUsers || existingUsers.length === 0) {
      // Code ist eindeutig
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Konnte keinen eindeutigen Friend-Code generieren. Bitte versuchen Sie es später erneut.');
}

/**
 * Findet einen User anhand des Friend-Codes
 * @param friendCode - Der zu suchende Friend-Code
 */
export async function findUserByFriendCode(friendCode: string): Promise<PlatformUser | null> {
  try {
    const formattedCode = formatFriendCode(friendCode);
    
    // Validiere den Friend-Code Format
    if (!validateFriendCode(formattedCode)) {
      throw new Error('Ungültiges Friend-Code-Format.');
    }
    
    // Suche in Firestore
    const users = await getCollection<PlatformUser>(
      'platform/users',
      [where('friendCode', '==', formattedCode)]
    );
    
    if (users && users.length > 0) {
      return users[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by friend code:', error);
    throw new Error('Fehler beim Suchen des Benutzers.');
  }
}
