import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function POST(request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const result = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const user = result[0];
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });

  const passwordHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
