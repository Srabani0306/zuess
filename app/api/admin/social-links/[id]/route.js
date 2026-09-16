import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("social_links.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(socialLinks).set({ platform: body.platform, url: body.url, sortOrder: body.sortOrder || 0, published: body.published !== false, updatedAt: new Date() }).where(eq(socialLinks.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("social_links.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(socialLinks).where(eq(socialLinks.id, params.id));
  return NextResponse.json({ ok: true });
}
