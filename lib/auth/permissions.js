import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { permissions as permissionsTable, rolePermissions } from "@/lib/schema";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { getSession } from "./session";

const FULL_ACCESS_ROLES = ["ADMIN", "SUPERADMIN"];

export function roleHasFullAccess(role) {
  return FULL_ACCESS_ROLES.includes(role);
}

/**
 * Resolves the flat list of permission keys a user should be granted. Called once at login time
 * and baked into the JWT session (see createSession in ./session.js) so route handlers can check
 * `session.permissions` without a DB round trip on every request.
 */
export async function getUserPermissions(user) {
  if (roleHasFullAccess(user.role)) return PERMISSION_KEYS;
  if (!user.roleId) return [];
  const rows = await db
    .select({ key: permissionsTable.key })
    .from(rolePermissions)
    .innerJoin(permissionsTable, eq(rolePermissions.permissionId, permissionsTable.id))
    .where(eq(rolePermissions.roleId, user.roleId));
  return rows.map((row) => row.key);
}

/**
 * Baseline gate: is this a signed-in admin-panel user at all? True for ADMIN/SUPERADMIN, or a
 * staff account that holds at least one permission. Used where a route (e.g. the shared media
 * upload endpoint) doesn't belong to one specific module and just needs "any admin user".
 */
export async function requireAdmin() {
  const session = await getSession();
  const isFullAccess = session && roleHasFullAccess(session.role);
  const isStaffWithAccess = session && Array.isArray(session.permissions) && session.permissions.length > 0;
  if (!isFullAccess && !isStaffWithAccess) throw new Error("UNAUTHORIZED");
  return session;
}

/**
 * Fine-grained gate: does the signed-in user hold this specific permission key? ADMIN/SUPERADMIN
 * always pass, regardless of what was baked into their token, so granting either role stays a
 * true "all permissions" guarantee even if a permission is added after the token was issued.
 */
export async function requirePermission(key) {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  if (roleHasFullAccess(session.role)) return session;
  if (Array.isArray(session.permissions) && session.permissions.includes(key)) return session;
  throw new Error("UNAUTHORIZED");
}
