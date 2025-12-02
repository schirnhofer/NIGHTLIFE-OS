/**
 * Chat Types for Nightlife OS
 * Extended in Phase 6 for Polls and Video
 * Extended in Phase 7 for Broadcast Chats
 */

export type MessageType = 'text' | 'image' | 'voice' | 'video' | 'poll';

export type MediaType = 'image' | 'voice' | 'video';

/**
 * Poll-Option mit Vote-Counts
 */
export interface PollOption {
  text: string;
  votes: string[]; // Array von User-IDs
}

/**
 * Poll-Daten für Messages
 */
export interface Poll {
  question: string;
  options: string[];                    // Liste der Optionen (Text)
  votes: Record<number, string[]>;      // Index → Array von User-IDs
  allowMultipleVotes: boolean;
  expiresAt?: number;                   // Optional: Unix-Timestamp
}

/**
 * Chat-Nachricht
 * Firestore: clubs/{clubId}/chats/{chatId}/messages/{messageId}
 */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  text?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  durationSeconds?: number;             // Für Voice/Video
  ephemeralSeconds?: number;            // Für selbstzerstörende Medien
  poll?: Poll;                          // Für Umfragen
  createdAt: number;
}

/**
 * Chat-Modi für Broadcast-Funktionalität (Phase 7)
 */
export type ChatMode = 'normal' | 'broadcast';

/**
 * Broadcast-Scope für Admin-Chats (Phase 7)
 */
export type BroadcastScope = 'global' | 'club';

/**
 * Chat-Dokument
 * Firestore: clubs/{clubId}/chats/{chatId}
 */
export interface Chat {
  id: string;
  clubId?: string;                      // Optional für private Chats
  type: 'private' | 'group';
  name?: string;                        // Für Gruppenchats
  participants: string[];               // Array von User-IDs
  creatorId?: string;                   // Ersteller des Gruppenchats
  createdAt: number;
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: number;
  };
  
  // Phase 7: Broadcast-Funktionalität
  mode?: ChatMode;                      // 'normal' oder 'broadcast'
  allowedSenders?: string[];            // User-IDs die senden dürfen (bei Broadcast)
  allowReactions?: boolean;             // Ob Reaktionen/Votes erlaubt sind
  broadcastScope?: BroadcastScope;      // 'global' (Super-Admin) oder 'club' (Club-Admin)
}
