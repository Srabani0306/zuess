import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { hashPassword, requirePermission, roleHasFullAccess } from "@/lib/auth";

const FULL_ACCESS_ROLES = ["ADMIN", "SUPERADMIN"];

export async function PATCH(request, { params }) {
  let session;
  try { session = await requirePermission("users.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  const target = (await db.select().from(users).where(eq(users.id, params.id)).limit(1))[0];
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const body = await request.json();
  const patch = { updatedAt: new Date() };

  if (body.name && body.name.trim()) patch.name = body.name.trim();

  if (body.role) {
    const nextRole = FULL_ACCESS_ROLES.includes(body.role) ? body.role : "STAFF";
    const changingFullAccess = FULL_ACCESS_ROLES.includes(nextRole) || FULL_ACCESS_ROLES.includes(target.role);
    if (changingFullAccess && !roleHasFullAccess(session.role)) {
      return NextResponse.json({ error: "Only an Admin or Superadmin can change Admin/Superadmin access." }, { status: 403 });
    }
    if (target.role === "SUPERADMIN" && nextRole !== "SUPERADMIN") {
      const otherSuperadmins = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "SUPERADMIN"), ne(users.id, target.id))).limit(1);
      if (!otherSuperadmins[0]) return NextResponse.json({ error: "At least one Superadmin must remain." }, { status: 409 });
    }
    patch.role = nextRole;
    patch.roleId = nextRole === "STAFF" ? body.roleId || null : null;
  }

  if (body.newPassword) {
    if (body.newPassword.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    patch.passwordHash = await hashPassword(body.newPassword);
  }

  await db.update(users).set(patch).where(eq(users.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  let session;
  try { session = await requirePermission("users.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  if (session.userId === params.id) return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });

  const target = (await db.select().from(users).where(eq(users.id, params.id)).limit(1))[0];
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  if (target.role === "SUPERADMIN") {
    const otherSuperadmins = await db.select({ id: users.id }).from(users).where(and(eq(users.role, "SUPERADMIN"), ne(users.id, target.id))).limit(1);
    if (!otherSuperadmins[0]) return NextResponse.json({ error: "At least one Superadmin must remain." }, { status: 409 });
  }

  await db.delete(users).where(eq(users.id, params.id));
  return NextResponse.json({ ok: true });
}
