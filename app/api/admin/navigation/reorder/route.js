import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { navigationItems } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request) {
  try { await requirePermission("navigation.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  for (const { id, sortOrder } of items) {
    if (!id) continue;
    await db.update(navigationItems).set({ sortOrder: Number(sortOrder) || 0, updatedAt: new Date() }).where(eq(navigationItems.id, id));
  }
  return NextResponse.json({ ok: true });
}
