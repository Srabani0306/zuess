import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { createSession, verifyPassword, getUserPermissions, roleHasFullAccess } from "@/lib/auth";
import { db, hasPlaceholderCredentials } from "@/lib/db";
import { roles, users } from "@/lib/schema";

export async function POST(request) {
  try {
    if (hasPlaceholderCredentials) {
      return NextResponse.json({ error: "Turso is not configured. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to .env, restart the server, then run npm run db:setup." }, { status: 503 });
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const result = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    const user = result[0];
    const valid = user && (await verifyPassword(password, user.passwordHash));
    /* Anyone with the ADMIN/SUPERADMIN role, or a staff account with a role assigned, may sign in.
       A user with neither (no roleId and not ADMIN/SUPERADMIN) has no admin-panel access at all. */
    const hasAccess = user && (roleHasFullAccess(user.role) || Boolean(user.roleId));
    if (!valid || !hasAccess) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    let roleName = null;
    if (user.roleId) {
      const roleRow = await db.select({ name: roles.name }).from(roles).where(eq(roles.id, user.roleId)).limit(1);
      roleName = roleRow[0]?.name || null;
    }
    const permissions = await getUserPermissions(user);

    await createSession({ ...user, roleName, permissions });
    return NextResponse.json({ user: { name: user.name, email: user.email, role: user.role, roleName, permissions } });
  } catch (error) {
    console.error("Admin login failed:", error);
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
