import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const SALT_ROUNDS = 12;
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a one-time password-reset token. Returns the raw token (goes in the emailed link)
 * separately from its SHA-256 hash (what gets stored) — the raw value is never persisted, so a
 * database leak alone can't be used to reset anyone's password.
 */
export function createResetToken() {
  const token = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
