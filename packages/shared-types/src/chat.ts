/**
 * Chat-Typen für Nightlife OS
 * 
 * Umfasst:
 * - Chat-Metadaten (1:1 und Gruppen)
 * - Nachrichten
 * - Ephemeral Images & Media
 * - Voice Messages
 * Phase 5: Erweitert um MessageType und mediaUrl
 */

// ===== CHAT-METADATEN =====

/**
 * Chat (clubs/{clubId}/chats/{chatId})
 * 
 * Chat-ID-Format:
 * - 1:1: "{uid1}_{uid2}" (alphabetisch sortiert)
 * - Gruppe: Auto-generierte Firestore-ID
 */
export interface Chat {
  chatId: string;
  type: 'private' | 'group';
  
  // Nur bei Gruppen
  name?: string;
  createdBy?: string; // UID des Creators
  
  // Teilnehmer
  participants: string[]; // UIDs
  
  // Letzte Nachricht (für Preview)
  lastMessageAt: number; // Unix-Timestamp (ms)
  lastMessagePreview?: string;
  
  // Timestamps
  createdAt: number;
}

// ===== NACHRICHTEN =====

/**
 * Message-Typ
 * Phase 5: Generisch für zukünftige Erweiterungen (Video)
 */
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'system';

/**
 * Nachricht (clubs/{clubId}/chats/{chatId}/messages/{messageId})
 * Phase 5: Erweitert um type, mediaUrl, mediaType, durationSeconds
 */
export interface Message {
  messageId: string;
  type: MessageType;
  
  // Text (optional bei Medien)
  text?: string;
  
  // Media (neu in Phase 5)
  mediaUrl?: string; // Firebase Storage URL
  mediaType?: 'image' | 'audio' | 'video';
  durationSeconds?: number; // Für Audio/Video
  
  // Backwards compatibility (deprecated, use mediaUrl)
  image?: string; // Base64 oder Storage-URL
  
  // Sender
  sender: string; // UID
  senderName: string;
  
  // Ephemeral (selbstzerstörend)
  ephemeral?: number; // Sekunden bis Auto-Löschung (z.B. 5)
  expiresAt?: number; // Unix-Timestamp (ms)
  
  // Gelesen-Status
  viewedBy: string[]; // UIDs
  
  // Gelöscht?
  deleted: boolean;
  
  // Timestamps
  createdAt: number;
}

/**
 * Minimale Message-Info für UI-Anzeige
 */
export interface MessagePreview {
  messageId: string;
  text: string;
  senderName: string;
  createdAt: number;
  isOwnMessage: boolean;
}

// ===== TYPING-INDICATOR =====

/**
 * Typing-Indicator für Realtime-Updates
 */
export interface TypingIndicator {
  userId: string;
  userName: string;
  chatId: string;
  isTyping: boolean;
  timestamp: number;
}
