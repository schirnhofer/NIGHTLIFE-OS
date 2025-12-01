import { Timestamp, FieldValue } from 'firebase/firestore'

/**
 * User-Rollen
 */
export type UserRole = 'admin' | 'guest'

/**
 * Trust-Level für das Trust-Modell
 */
export type TrustedLevel = 0 | 1 | 2 | 3 | 4 | 5

/**
 * Basis-User-Interface (alte Struktur)
 */
export interface User {
  email: string
  uid: string
  role: UserRole
  checkedIn: boolean
  friendCode?: string // 7-stelliger Code (nur für Gäste)
}

/**
 * Erweiterte User-Felder für Trust-Modell
 */
export interface UserTrustFields {
  phoneNumber?: string | null
  phoneVerified: boolean
  deviceIdHash?: string | null // SHA256-Hash der DeviceId
  faceHash?: string | null // SHA256-Hash des Gesichts-Embeddings
  faceThumbnailUrl?: string | null // URL zum Gesichts-Thumbnail
  faceStoragePath?: string | null // Storage-Pfad zum Originalbild
  faceConsent: {
    given: boolean
    ts: number
    version: string
  } | null
  trustedLevel: TrustedLevel
  verifiedBy: {
    staffId: string | null
    at: number | null
  } | null
}

/**
 * Vollständiges User-Profil mit Trust-Feldern
 */
export interface UserProfile extends User, UserTrustFields {}

/**
 * User-Profil in der Multi-Club-Struktur
 */
export interface ClubUserProfile extends UserProfile {
  language?: string // Sprachpräferenz (de, en, etc.)
  displayName?: string
  createdAt?: number
  updatedAt?: number
}

/**
 * Freund in der SubCollection
 */
export interface Friend {
  email: string
  uid: string
}

/**
 * Freundschaftsanfrage in der SubCollection
 */
export interface FriendRequest {
  id?: string // Document-ID
  email: string
  uid: string
  friendCode: string
  message: string
  timestamp: number
}

/**
 * Chat-Typen
 */
export type ChatType = 'private' | 'group'

/**
 * Chat-Document (für Gruppen)
 */
export interface Chat {
  id?: string
  type: ChatType
  name?: string // Nur für Gruppen
  participants: string[] // Array von UIDs
  createdBy?: string // Nur für Gruppen
  createdAt?: number
}

/**
 * Chat-Nachricht
 */
export interface ChatMessage {
  id?: string
  text: string
  image?: string | null // Base64 oder Storage-URL
  ephemeral?: number | null // Timer in Sekunden
  sender: string // UID
  createdAt: number
}

/**
 * Globaler App-Status-Modus
 */
export type GlobalStateMode = 
  | 'normal' 
  | 'lightshow' 
  | 'message' 
  | 'countdown' 
  | 'lottery_result'

/**
 * Lichtshow-Konfiguration
 */
export interface LightConfig {
  type: 'color' | 'strobe' | 'psychedelic' | 'audio_sync'
  color?: string // Hex-Code (z.B. '#ff0000')
  intensity?: number // 0-255 für Audio-Sync
}

/**
 * Globaler App-Status (public/globalState)
 */
export interface GlobalState {
  mode: GlobalStateMode
  messageText?: string
  targetGroup?: 'in' | 'out' | 'all'
  lightConfig?: LightConfig
  targetTime?: number // Countdown-Zielzeit
  winnerIds?: string[]
  prizeCode?: string
}

/**
 * Multi-Club Globaler Status (clubs/{clubId}/state/global)
 */
export interface ClubGlobalState extends GlobalState {
  clubId?: string
  updatedAt?: number
  updatedBy?: string // UID des Admins
}

/**
 * Chat-Target für die Chat-Komponente
 */
export type ChatTarget = 
  | { type: 'private'; uid: string; email: string }
  | { type: 'group'; id: string; name: string }
