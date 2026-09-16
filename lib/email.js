/**
 * No email provider (SMTP, Resend, SES, ...) is configured in this project yet, so this is a
 * stub: it logs the message to the server console instead of actually sending anything. Replace
 * the body below with a real provider call when one is available — callers (see
 * app/api/auth/forgot-password/route.js) don't need to change.
 */
export async function sendPasswordResetEmail(user, resetUrl) {
  console.log(`[email:stub] Password reset requested for ${user.email}`);
  console.log(`[email:stub] Reset link (valid 1 hour): ${resetUrl}`);
}
