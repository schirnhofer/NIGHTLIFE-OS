/**
 * Chat-Typen für Nightlife OS
 * 
 * Umfasst:
 * - Chat-Metadaten (1:1 und Gruppen)
 * - Nachrichten
 * - Ephemeral Images & Media
 * - Voice Messages
 * - Video Messages (Phase 5)
 * - Polls (Phase 6)
 * Phase 6: Erweitert um MessageType 'poll', Message.poll, Chat.mode/allowedSenders/allowReactions
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
  
  // Phase 6: Chat-Rechte-Modell (Vorbereitung für Phase 7)
  mode?: 'normal' | 'broadcast'; // normal = alle dürfen senden, broadcast = nur allowedSenders
  allowedSenders?: string[]; // UIDs, die in broadcast-Chats senden dürfen
  allowReactions?: boolean; // Dürfen Nutzer auf Nachrichten reagieren?
}

// ===== NACHRICHTEN =====

/**
 * Message-Typ
 * Phase 5: Generisch für zukünftige Erweiterungen (Video)
 * Phase 6: Erweitert um 'poll'
 */
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'poll' | 'system';

/**
 * Nachricht (clubs/{clubId}/chats/{chatId}/messages/{messageId})
 * Phase 5: Erweitert um type, mediaUrl, mediaType, durationSeconds
 * Phase 6: Erweitert um poll
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
  
  // Poll (neu in Phase 6)
  poll?: {
    question: string;
    options: string[]; // Array von Option-Texten
    votes: Record<number, string[]>; // optionIndex -> Array von UIDs
    allowMultipleVotes?: boolean; // Dürfen User mehrere Optionen wählen?
    expiresAt?: number; // Unix-Timestamp (ms), optional
  };
  
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
