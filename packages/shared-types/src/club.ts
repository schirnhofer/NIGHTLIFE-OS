/**
 * Club-Typen für Nightlife OS
 * 
 * Umfasst:
 * - Club-Stammdaten (platform/clubs/{clubId})
 * - Club-Gruppen (platform/groups/{groupId})
 * - Club-State (clubs/{clubId}/state/global)
 * - Club-Settings (clubs/{clubId}/config/settings)
 */

// ===== CLUB-STAMMDATEN (Plattform-Ebene) =====

/**
 * Club-Stammdaten (platform/clubs/{clubId})
 */
export interface Club {
  clubId: string;
  name: string; // Offizieller Club-Name
  slug: string; // URL-freundlicher Name
  groupId: string | null; // Zugehörige Club-Gruppe (falls vorhanden)
  ownerId: string; // Firebase UID des Besitzers
  
  // Subscription
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'paused' | 'cancelled' | 'trial';
  subscriptionEndsAt: number | null; // Unix-Timestamp (ms)
  
  // Kontaktdaten
  address: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  contact: {
    email?: string;
    phone?: string;
    website?: string;
  };
  
  // Club-Details
  openingHours: Record<string, string>; // { "monday": "22:00-05:00", ... }
  capacity: number; // Max. Gästeanzahl
  
  // Features & Theme
  features: string[]; // ["chat", "lightshow", "orders", "cloakroom"]
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    logo?: string; // URL zum Logo
  };
  
  // Trust-System
  trustedMode: boolean;
  
  // Sprache
  language: string; // Standard-Sprache
  
  // Timestamps
  createdAt: number;
  updatedAt: number;
}

/**
 * Club-Gruppe (platform/groups/{groupId})
 * Für Clubs, die zu einer Kette gehören
 */
export interface ClubGroup {
  groupId: string;
  name: string; // z.B. "Nachtwerk Group"
  ownerId: string;
  clubIds: string[]; // Alle Clubs in der Gruppe
  sharedFeatures: string[]; // Features, die alle Clubs teilen
  createdAt: number;
}

// ===== CLUB-STATE (Realtime) =====

/**
 * Globaler Club-State (clubs/{clubId}/state/global)
 * Für Realtime-Features wie Lichtshow, Countdown, Gewinnspiele
 */
export interface ClubState {
  mode: 'normal' | 'lightshow' | 'message' | 'countdown' | 'lottery_result';
  
  // Lichtshow
  lightColor: string | null; // Hex-Code (z.B. "#ff0000")
  lightEffect: 'color' | 'strobe' | 'psychedelic' | 'audio_sync' | null;
  audioSyncIntensity: number | null; // 0-255
  
  // Countdown
  countdownActive: boolean;
  countdownEnd: number | null; // Unix-Timestamp (ms)
  countdownMessage: string | null;
  
  // Gewinnspiel
  activeGame: 'lottery' | null;
  winnerIds: string[];
  prizeCode: string | null;
  
  // Broadcast-Message
  messageText: string | null;
  messageTarget: 'in' | 'out' | 'all' | null; // in=eingecheckt, out=nicht eingecheckt
}

// ===== CLUB-SETTINGS =====

/**
 * Club-Einstellungen (clubs/{clubId}/config/settings)
 */
export interface ClubSettings {
  // Feature-Flags
  features: {
    chat: boolean;
    lightshow: boolean;
    orders: boolean;
    cloakroom: boolean;
    lottery: boolean;
  };
  
  // Theme
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor?: string;
    logo?: string;
  };
  
  // Öffnungszeiten
  openingHours: Record<string, string>;
  
  // Geo-Location
  checkInRadius: number; // Meter
  location: {
    lat: number;
    lng: number;
  };
  
  // Sprachen
  languages: string[]; // ["de", "en", "fr"]
  defaultLanguage: string;
  
  // Trust-System
  trustModeEnabled: boolean;
  minTrustLevelForEntry: number; // 0-100
  
  // Auto-Checkout
  autoCheckoutAfterHours: number; // Stunden
}
