/**
 * API-Response-Typen für Nightlife OS
 * 
 * Definiert einheitliche Response-Formate für alle API-Calls
 */

// ===== GENERIC API RESPONSES =====

/**
 * Erfolgreiche API-Response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: number;
}

/**
 * Fehler-API-Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: number;
}

/**
 * Union-Type für alle API-Responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ===== ERROR CODES =====

/**
 * Standard-Fehlercodes
 */
export enum ApiErrorCode {
  // Auth
  AUTH_REQUIRED = 'auth/required',
  AUTH_INVALID = 'auth/invalid',
  AUTH_EXPIRED = 'auth/expired',
  
  // Permission
  PERMISSION_DENIED = 'permission/denied',
  PERMISSION_INSUFFICIENT = 'permission/insufficient',
  
  // Validation
  VALIDATION_FAILED = 'validation/failed',
  VALIDATION_MISSING_FIELD = 'validation/missing-field',
  VALIDATION_INVALID_FORMAT = 'validation/invalid-format',
  
  // Resource
  RESOURCE_NOT_FOUND = 'resource/not-found',
  RESOURCE_ALREADY_EXISTS = 'resource/already-exists',
  RESOURCE_CONFLICT = 'resource/conflict',
  
  // Club
  CLUB_NOT_FOUND = 'club/not-found',
  CLUB_SUBSCRIPTION_EXPIRED = 'club/subscription-expired',
  CLUB_FEATURE_DISABLED = 'club/feature-disabled',
  
  // User
  USER_NOT_FOUND = 'user/not-found',
  USER_NOT_CHECKED_IN = 'user/not-checked-in',
  USER_BLACKLISTED = 'user/blacklisted',
  USER_TRUST_LEVEL_TOO_LOW = 'user/trust-level-too-low',
  
  // Chat
  CHAT_NOT_FOUND = 'chat/not-found',
  CHAT_NOT_PARTICIPANT = 'chat/not-participant',
  
  // Server
  SERVER_ERROR = 'server/error',
  SERVER_UNAVAILABLE = 'server/unavailable',
}

// ===== SPECIFIC API RESPONSES =====

/**
 * Auth-Response (Login/Signup)
 */
export interface AuthResponse {
  user: {
    uid: string;
    email: string;
    displayName: string | null;
  };
  token: string;
}

/**
 * Check-In-Response
 */
export interface CheckInResponse {
  success: boolean;
  checkedIn: boolean;
  checkedInAt: number;
  clubName: string;
}

/**
 * Friend-Code-Validation-Response
 */
export interface FriendCodeValidationResponse {
  valid: boolean;
  user?: {
    uid: string;
    displayName: string;
    photoURL: string | null;
  };
}

/**
 * QR-Code-Scan-Response
 */
export interface QRCodeScanResponse {
  type: 'check-in' | 'cloakroom-ticket' | 'user-profile';
  data: unknown;
}
