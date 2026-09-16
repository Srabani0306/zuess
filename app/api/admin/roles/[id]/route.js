import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { permissions, rolePermissions, roles, users } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("roles.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  const role = (await db.select().from(roles).where(eq(roles.id, params.id)).limit(1))[0];
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Superadmin and Admin already hold every permission and can't be edited." }, { status: 403 });

  const body = await request.json();
  if (body.name && body.name.trim()) {
    await db.update(roles).set({ name: body.name.trim(), updatedAt: new Date() }).where(eq(roles.id, params.id));
  }

  if (Array.isArray(body.permissionKeys)) {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, params.id));
    const permissionRows = await db.select().from(permissions);
    const permissionId = Object.fromEntries(permissionRows.map((row) => [row.key, row.id]));
    for (const key of body.permissionKeys) {
      if (!permissionId[key]) continue;
      await db.insert(rolePermissions).values({ id: crypto.randomUUID(), roleId: params.id, permissionId: permissionId[key] });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("roles.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  const role = (await db.select().from(roles).where(eq(roles.id, params.id)).limit(1))[0];
  if (!role) return NextResponse.json({ error: "Role not found." }, { status: 404 });
  if (role.isSystem) return NextResponse.json({ error: "Superadmin and Admin can't be deleted." }, { status: 403 });

  const assignedUsers = await db.select({ id: users.id }).from(users).where(eq(users.roleId, params.id)).limit(1);
  if (assignedUsers[0]) return NextResponse.json({ error: "Reassign users out of this role before deleting it." }, { status: 409 });

  await db.delete(roles).where(eq(roles.id, params.id));
  return NextResponse.json({ ok: true });
}
