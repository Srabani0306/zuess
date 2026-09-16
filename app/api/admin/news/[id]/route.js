import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("news.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(news).set({ title: body.title, link: body.link || null, sortOrder: body.sortOrder || 0, published: body.published !== false, updatedAt: new Date() }).where(eq(news.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("news.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(news).where(eq(news.id, params.id));
  return NextResponse.json({ ok: true });
}
