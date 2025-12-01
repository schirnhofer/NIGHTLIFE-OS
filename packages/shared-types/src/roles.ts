/**
 * Rollen-Typen für Nightlife OS
 * 
 * Definiert alle verfügbaren Rollen und ihre Hierarchie
 */

// ===== ROLLEN =====

/**
 * Alle verfügbaren Rollen
 */
export enum Role {
  // Plattform-Ebene
  SUPER_ADMIN = 'super_admin',
  
  // Club-Ebene
  CLUB_ADMIN = 'admin',
  OWNER = 'owner',
  
  // Steuerung
  DJ = 'dj',
  LICHTJOCKEY = 'lichtjockey',
  
  // Personal (Basis)
  STAFF = 'staff',
  
  // Personal (Spezifisch)
  DOOR = 'door',
  WAITER = 'waiter',
  BAR = 'bar',
  CLOAKROOM = 'cloakroom',
  
  // Gast
  GUEST = 'guest',
}

/**
 * Rollen-String-Union für TypeScript
 */
export type RoleString = 
  | 'super_admin'
  | 'admin'
  | 'owner'
  | 'dj'
  | 'lichtjockey'
  | 'staff'
  | 'door'
  | 'waiter'
  | 'bar'
  | 'cloakroom'
  | 'guest';

// ===== BERECHTIGUNGEN =====

/**
 * Berechtigungs-Kategorien
 */
export enum Permission {
  // Platform
  PLATFORM_ADMIN = 'platform:admin',
  PLATFORM_CLUBS_READ = 'platform:clubs:read',
  PLATFORM_CLUBS_WRITE = 'platform:clubs:write',
  
  // Club-Admin
  CLUB_SETTINGS_READ = 'club:settings:read',
  CLUB_SETTINGS_WRITE = 'club:settings:write',
  CLUB_STAFF_MANAGE = 'club:staff:manage',
  CLUB_ANALYTICS_READ = 'club:analytics:read',
  
  // Club-State
  CLUB_STATE_READ = 'club:state:read',
  CLUB_STATE_WRITE = 'club:state:write',
  
  // Users
  USERS_READ_ALL = 'users:read:all',
  USERS_READ_OWN = 'users:read:own',
  USERS_WRITE_OWN = 'users:write:own',
  USERS_VERIFY = 'users:verify',
  
  // Chat
  CHAT_READ_OWN = 'chat:read:own',
  CHAT_WRITE_OWN = 'chat:write:own',
  CHAT_READ_ALL = 'chat:read:all',
  
  // Orders
  ORDERS_READ = 'orders:read',
  ORDERS_WRITE = 'orders:write',
  
  // Cloakroom
  CLOAKROOM_READ = 'cloakroom:read',
  CLOAKROOM_WRITE = 'cloakroom:write',
}

/**
 * Berechtigungsmatrix: Rolle -> Berechtigungen
 */
export const ROLE_PERMISSIONS: Record<RoleString, Permission[]> = {
  super_admin: [
    Permission.PLATFORM_ADMIN,
    Permission.PLATFORM_CLUBS_READ,
    Permission.PLATFORM_CLUBS_WRITE,
    // ... alle weiteren Permissions
  ],
  
  admin: [
    Permission.CLUB_SETTINGS_READ,
    Permission.CLUB_SETTINGS_WRITE,
    Permission.CLUB_STAFF_MANAGE,
    Permission.CLUB_ANALYTICS_READ,
    Permission.CLUB_STATE_READ,
    Permission.CLUB_STATE_WRITE,
    Permission.USERS_READ_ALL,
    Permission.CHAT_READ_ALL,
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
    Permission.CLOAKROOM_READ,
    Permission.CLOAKROOM_WRITE,
  ],
  
  owner: [
    // Gleiche Permissions wie admin
    Permission.CLUB_SETTINGS_READ,
    Permission.CLUB_SETTINGS_WRITE,
    Permission.CLUB_STAFF_MANAGE,
    Permission.CLUB_ANALYTICS_READ,
    Permission.CLUB_STATE_READ,
    Permission.CLUB_STATE_WRITE,
    Permission.USERS_READ_ALL,
  ],
  
  dj: [
    Permission.CLUB_STATE_READ,
    Permission.CLUB_STATE_WRITE,
    Permission.USERS_READ_ALL,
  ],
  
  lichtjockey: [
    Permission.CLUB_STATE_READ,
    Permission.CLUB_STATE_WRITE,
  ],
  
  staff: [
    Permission.USERS_READ_ALL,
    Permission.USERS_READ_OWN,
    Permission.USERS_WRITE_OWN,
  ],
  
  door: [
    Permission.USERS_READ_ALL,
    Permission.USERS_VERIFY,
  ],
  
  waiter: [
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
  ],
  
  bar: [
    Permission.ORDERS_READ,
    Permission.ORDERS_WRITE,
  ],
  
  cloakroom: [
    Permission.CLOAKROOM_READ,
    Permission.CLOAKROOM_WRITE,
  ],
  
  guest: [
    Permission.CLUB_STATE_READ,
    Permission.USERS_READ_OWN,
    Permission.USERS_WRITE_OWN,
    Permission.CHAT_READ_OWN,
    Permission.CHAT_WRITE_OWN,
  ],
};

/**
 * Rollen-Labels für UI
 */
export const ROLE_LABELS: Record<RoleString, string> = {
  super_admin: 'Super-Admin',
  admin: 'Club-Admin',
  owner: 'Besitzer',
  dj: 'DJ',
  lichtjockey: 'Lichtjockey',
  staff: 'Personal',
  door: 'Türsteher',
  waiter: 'Kellner',
  bar: 'Bar-Personal',
  cloakroom: 'Garderobe',
  guest: 'Gast',
};
