/**
 * Rollen-Definitionen
 */

import { Role, RoleString } from '@nightlife-os/shared-types';

export { Role };
export type { RoleString };

// Re-export für einfacheren Zugriff
export const ROLES = {
  SUPER_ADMIN: Role.SUPER_ADMIN,
  CLUB_ADMIN: Role.CLUB_ADMIN,
  OWNER: Role.OWNER,
  DJ: Role.DJ,
  LICHTJOCKEY: Role.LICHTJOCKEY,
  STAFF: Role.STAFF,
  DOOR: Role.DOOR,
  WAITER: Role.WAITER,
  BAR: Role.BAR,
  CLOAKROOM: Role.CLOAKROOM,
  GUEST: Role.GUEST,
} as const;
