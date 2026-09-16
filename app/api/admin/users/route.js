import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { roles, users } from "@/lib/schema";
import { getSession, hashPassword, requirePermission, roleHasFullAccess } from "@/lib/auth";

const FULL_ACCESS_ROLES = ["ADMIN", "SUPERADMIN"];

async function listUsers() {
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, roleId: users.roleId, roleName: roles.name, createdAt: users.createdAt })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .orderBy(asc(users.name));
  return rows;
}

export async function GET() {
  try { await requirePermission("users.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await listUsers());
}

export async function POST(request) {
  let session;
  try { session = await requirePermission("users.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  const body = await request.json();
  const { name, email, password } = body;
  const role = FULL_ACCESS_ROLES.includes(body.role) ? body.role : "STAFF";
  if (!name || !email || !password) return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  /* Only an existing full-access (ADMIN/SUPERADMIN) caller may mint another full-access account —
     a staff member holding only the users.manage permission can create/manage staff, not admins. */
  if (FULL_ACCESS_ROLES.includes(role) && !roleHasFullAccess(session.role)) {
    return NextResponse.json({ error: "Only an Admin or Superadmin can create another Admin/Superadmin account." }, { status: 403 });
  }

  const roleId = role === "STAFF" ? body.roleId || null : null;
  if (role === "STAFF" && !roleId) {
    return NextResponse.json({ error: "Choose a role to define this staff member's permissions." }, { status: 400 });
  }

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A user with that email already exists." }, { status: 409 });

  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ id, name: name.trim(), email: email.toLowerCase().trim(), passwordHash, role, roleId });

  return NextResponse.json({ id }, { status: 201 });
}
