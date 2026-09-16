/**
 * Barrel for the auth module. Kept as `lib/auth.js` (rather than `lib/auth/index.js`) so every
 * existing `import ... from "@/lib/auth"` call site keeps resolving unambiguously — the actual
 * logic lives in lib/auth/{session,permissions,password}.js.
 */
export { createSession, getSession, clearSession } from "./auth/session";
export { requireAdmin, requirePermission, getUserPermissions, roleHasFullAccess } from "./auth/permissions";
export { hashPassword, verifyPassword, createResetToken, hashResetToken } from "./auth/password";
