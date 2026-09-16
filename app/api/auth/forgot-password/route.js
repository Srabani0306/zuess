import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createResetToken } from "@/lib/auth";
import { db, hasPlaceholderCredentials } from "@/lib/db";
import { passwordResets, users } from "@/lib/schema";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
  try {
    if (hasPlaceholderCredentials) {
      return NextResponse.json({ error: "Turso is not configured." }, { status: 503 });
    }

    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    const user = result[0];

    /* Always respond the same way whether or not the account exists, so this endpoint can't be
       used to discover which emails have an admin account. */
    if (user) {
      const { token, tokenHash, expiresAt } = createResetToken();
      await db.insert(passwordResets).values({
        id: crypto.randomUUID(),
        userId: user.id,
        tokenHash,
        expiresAt,
      });
      const resetUrl = `${request.nextUrl.origin}/admin/reset-password?token=${token}`;
      await sendPasswordResetEmail(user, resetUrl);
    }

    return NextResponse.json({ ok: true, message: "If that email has an account, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return NextResponse.json({ error: "Unable to process request right now." }, { status: 500 });
  }
}
