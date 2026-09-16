import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { permissions, rolePermissions, roles } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

async function attachPermissions(roleRows) {
  const links = await db
    .select({ roleId: rolePermissions.roleId, key: permissions.key })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id));
  const byRole = {};
  for (const link of links) {
    (byRole[link.roleId] ||= []).push(link.key);
  }
  return roleRows.map((role) => ({ ...role, permissionKeys: byRole[role.id] || [] }));
}

export async function GET() {
  try { await requirePermission("roles.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const roleRows = await db.select().from(roles).orderBy(asc(roles.name));
  return NextResponse.json(await attachPermissions(roleRows));
}

export async function POST(request) {
  try { await requirePermission("roles.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.name || !body.name.trim()) return NextResponse.json({ error: "Role name is required." }, { status: 400 });

  const slug = body.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const existing = await db.select().from(roles).where(eq(roles.slug, slug)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A role with that name already exists." }, { status: 409 });

  const id = crypto.randomUUID();
  await db.insert(roles).values({ id, name: body.name.trim(), slug, isSystem: false });

  const permissionKeys = Array.isArray(body.permissionKeys) ? body.permissionKeys : [];
  if (permissionKeys.length) {
    const permissionRows = await db.select().from(permissions);
    const permissionId = Object.fromEntries(permissionRows.map((row) => [row.key, row.id]));
    for (const key of permissionKeys) {
      if (!permissionId[key]) continue;
      await db.insert(rolePermissions).values({ id: crypto.randomUUID(), roleId: id, permissionId: permissionId[key] });
    }
  }

  return NextResponse.json({ id }, { status: 201 });
}
