/**
 * Order-Typen für Nightlife OS
 * 
 * Für Kellner/Bar-App (clubs/{clubId}/orders/{orderId})
 */

// ===== ORDER =====

/**
 * Bestellung (clubs/{clubId}/orders/{orderId})
 */
export interface Order {
  orderId: string;
  
  // Kunde
  userId: string | null; // Falls User eingeloggt ist
  
  // Tisch
  table: string | number; // z.B. "A5" oder 12
  
  // Bestellte Items
  items: OrderItem[];
  totalPrice: number; // EUR
  
  // Status
  status: 'open' | 'preparing' | 'served' | 'paid';
  
  // Personal
  createdBy: string; // UID des Kellners
  
  // Bezahlung
  paymentMethod: 'cash' | 'card' | 'app' | null;
  paidAt: number | null; // Unix-Timestamp (ms)
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Einzelner Bestellungs-Item
 */
export interface OrderItem {
  name: string; // z.B. "Bier"
  quantity: number;
  pricePerUnit: number; // EUR
  totalPrice: number; // quantity * pricePerUnit
  notes?: string; // z.B. "ohne Eis"
}

/**
 * Order-Status für UI-Anzeige
 */
export type OrderStatus = Order['status'];

/**
 * Order-Filter für Liste
 */
export interface OrderFilter {
  status?: OrderStatus | OrderStatus[];
  table?: string | number;
  createdBy?: string;
  dateFrom?: number;
  dateTo?: number;
}
