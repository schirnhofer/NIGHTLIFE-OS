/**
 * QR-Code-Utilities für Nightlife OS
 * 
 * Funktionen für QR-Code-Generierung und -Parsing
 */

/**
 * Generiert QR-Code-Daten für User (Friend-Code)
 * 
 * Format: nightlife://user/{friendCode}
 */
export function generateUserQR(friendCode: string): string {
  if (!friendCode || friendCode.length !== 7) {
    throw new Error('Invalid friend code');
  }
  return `nightlife://user/${friendCode.toUpperCase()}`;
}

/**
 * Parsed QR-Code-Daten
 */
export interface ParsedQR {
  type: 'user' | 'unknown';
  friendCode?: string;
  rawData: string;
}

/**
 * Parst QR-Code-Daten
 */
export function parseQR(qrString: string): ParsedQR {
  // Nightlife-Format: nightlife://user/{friendCode}
  const userMatch = qrString.match(/^nightlife:\/\/user\/([A-Z0-9]{7})$/);
  
  if (userMatch) {
    return {
      type: 'user',
      friendCode: userMatch[1],
      rawData: qrString
    };
  }

  // Unbekanntes Format
  return {
    type: 'unknown',
    rawData: qrString
  };
}

/**
 * Validiert, ob ein String ein gültiger Friend-Code ist
 */
export function isValidFriendCode(code: string): boolean {
  return /^[A-Z0-9]{7}$/.test(code);
}
