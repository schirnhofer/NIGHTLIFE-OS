/**
 * Freundschafts-Typen für Nightlife OS
 * 
 * Platform-Ebene: users/{uid}/friends und users/{uid}/requests
 */

// ===== FREUNDSCHAFT =====

/**
 * Freund (users/{uid}/friends/{friendId})
 */
export interface Friend {
  friendId: string; // UID des Freundes
  email: string;
  displayName: string | null;
  photoURL: string | null;
  friendCode: string; // 7-stelliger Code
  createdAt: number; // Unix-Timestamp (ms)
}

// ===== FREUNDSCHAFTSANFRAGEN =====

/**
 * Freundschaftsanfrage (users/{uid}/requests/{requesterId})
 */
export interface FriendRequest {
  requesterId: string; // UID des Anfragenden
  email: string;
  displayName: string | null;
  photoURL: string | null;
  friendCode: string; // 7-stelliger Code des Anfragenden
  message?: string; // Optionale Nachricht
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number; // Unix-Timestamp (ms)
}

// ===== HELPER-TYPEN =====

/**
 * Nachrichten-Optionen für Freundschaftsanfragen
 */
export const FRIEND_REQUEST_MESSAGES = [
  'Hi! 👋',
  'Lass anstoßen! 🥂',
  'Cooles Outfit! 🔥',
  'Nice Party! 🎉',
  'Treffen wir uns? 😊'
] as const;

export type FriendRequestMessage = typeof FRIEND_REQUEST_MESSAGES[number];
