/**
 * Validierungs-Funktionen
 */

/**
 * E-Mail-Validierung
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Passwort-Validierung (min. 6 Zeichen)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * URL-Validierung
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Hex-Color-Validierung
 */
export function isValidHexColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}
