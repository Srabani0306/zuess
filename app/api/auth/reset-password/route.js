import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { hashPassword, hashResetToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { passwordResets, users } from "@/lib/schema";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const tokenHash = hashResetToken(token);
    const result = await db.select().from(passwordResets).where(eq(passwordResets.tokenHash, tokenHash)).limit(1);
    const reset = result[0];

    if (!reset || reset.usedAt || new Date(reset.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, reset.userId));
    await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, reset.id));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password failed:", error);
    return NextResponse.json({ error: "Unable to reset password right now." }, { status: 500 });
  }
}
