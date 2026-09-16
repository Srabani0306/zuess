import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { navigationGroups, navigationItems } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";
import { syncServicePageForHrefChange } from "@/lib/servicePages";

async function authorize() {
  try { await requirePermission("navigation.manage"); return true; } catch { return false; }
}

export async function PATCH(request, { params }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json();
  const item = await db.select().from(navigationItems).where(eq(navigationItems.id, params.id)).limit(1);
  if (item[0]) {
    await db.update(navigationItems).set({ label: body.label, href: body.href, description: body.description || null, image: body.image || null, parentId: body.parentId || null, sortOrder: Number(body.sortOrder) || 0, updatedAt: new Date() }).where(eq(navigationItems.id, params.id));

    if (body.href && body.href !== item[0].href) {
      await syncServicePageForHrefChange({ previousHref: item[0].href, nextHref: body.href, label: body.label || item[0].label, description: body.description });
    }

    return NextResponse.json({ ok: true });
  }
  await db.update(navigationGroups).set({ label: body.label, updatedAt: new Date() }).where(eq(navigationGroups.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const item = await db.select().from(navigationItems).where(eq(navigationItems.id, params.id)).limit(1);
  if (item[0]) await db.delete(navigationItems).where(eq(navigationItems.id, params.id));
  else await db.delete(navigationGroups).where(eq(navigationGroups.id, params.id));
  return NextResponse.json({ ok: true });
}
