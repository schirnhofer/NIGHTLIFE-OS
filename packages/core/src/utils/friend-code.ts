/**
 * Friend-Code-Generator
 * 
 * Generiert 7-stellige alphanumerische Codes für Freundschafts-System
 * Format: ABXY489 (Großbuchstaben + Zahlen, keine Verwechslungsgefahr)
 */

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
