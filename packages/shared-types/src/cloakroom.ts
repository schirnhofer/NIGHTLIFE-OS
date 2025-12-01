/**
 * Cloakroom-Typen für Nightlife OS
 * 
 * Für Garderoben-App (clubs/{clubId}/cloakroom/{ticketId})
 */

// ===== CLOAKROOM-TICKET =====

/**
 * Garderoben-Ticket (clubs/{clubId}/cloakroom/{ticketId})
 */
export interface CloakroomTicket {
  ticketId: string; // z.B. "T-001234"
  
  // Kunde
  userId: string | null; // Falls User eingeloggt ist
  
  // Item
  itemDescription: string; // z.B. "Schwarze Lederjacke"
  notes?: string; // z.B. "Wertgegenstand in Tasche"
  
  // Status
  status: 'deposited' | 'retrieved' | 'lost';
  
  // Personal
  depositedBy: string; // UID des Garderoben-Staff
  retrievedBy: string | null; // UID des Staff bei Ausgabe
  
  // Timestamps
  depositedAt: number; // Unix-Timestamp (ms)
  retrievedAt: number | null;
}

/**
 * Cloakroom-Status für UI-Anzeige
 */
export type CloakroomStatus = CloakroomTicket['status'];

/**
 * Cloakroom-Filter für Liste
 */
export interface CloakroomFilter {
  status?: CloakroomStatus | CloakroomStatus[];
  depositedBy?: string;
  dateFrom?: number;
  dateTo?: number;
}
