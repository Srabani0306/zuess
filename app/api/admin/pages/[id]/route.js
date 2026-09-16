import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("pages.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(pages).set({ title: body.title, subtitle: body.subtitle || null, description: body.description || null, heroImage: body.heroImage || null, content: body.content || [], published: body.published !== false, updatedAt: new Date() }).where(eq(pages.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("pages.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(pages).where(eq(pages.id, params.id));
  return NextResponse.json({ ok: true });
}
