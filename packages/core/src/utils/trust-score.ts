/**
 * Trust-Score-Berechnung
 * 
 * Berechnet den Trust-Level eines Users basierend auf verschiedenen Faktoren
 * Platzhalter für Phase 3 (Trust-System)
 */

import { ClubUser } from '@nightlife-os/shared-types';

/**
 * Berechnet Trust-Score (0-100)
 * 
 * Faktoren:
 * - Phone-Verifizierung: +20
 * - Device-ID-Hash: +10
 * - Face-Hash: +10
 * - Anzahl Besuche: +1 pro Besuch (max +30)
 * - Staff-Verifizierung: +30
 */
export function calculateTrustScore(user: Partial<ClubUser>): number {
  let score = 0;

  // Phone-Verifizierung
  if (user.phoneVerified) {
    score += 20;
  }

  // Device-ID
  if (user.deviceIdHash) {
    score += 10;
  }

  // Face-Hash
  if (user.faceHash) {
    score += 10;
  }

  // Besuche (max +30)
  if (user.visitCount) {
    score += Math.min(user.visitCount, 30);
  }

  // Staff-Verifizierung
  if (user.staffVerified) {
    score += 30;
  }

  // Max 100
  return Math.min(score, 100);
}

/**
 * Trust-Level-Labels
 */
export function getTrustLevelLabel(score: number): string {
  if (score >= 80) return 'Sehr hoch';
  if (score >= 60) return 'Hoch';
  if (score >= 40) return 'Mittel';
  if (score >= 20) return 'Niedrig';
  return 'Sehr niedrig';
}

/**
 * Trust-Level-Farbe für UI
 */
export function getTrustLevelColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}
