/**
 * Berechtigungen
 */

import { Permission, ROLE_PERMISSIONS } from '@nightlife-os/shared-types';
import { RoleString } from './roles';

export { Permission, ROLE_PERMISSIONS };

/**
 * Prüft, ob eine Rolle eine bestimmte Berechtigung hat
 */
export function hasPermission(
  role: RoleString,
  permission: Permission
): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Prüft, ob ein User (mit mehreren Rollen) eine Berechtigung hat
 */
export function userHasPermission(
  roles: RoleString[],
  permission: Permission
): boolean {
  return roles.some(role => hasPermission(role, permission));
}
