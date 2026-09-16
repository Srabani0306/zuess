import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("testimonials.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(testimonials).set({ name: body.name, role: body.role || null, company: body.company || null, quote: body.quote, avatar: body.avatar || null, sortOrder: body.sortOrder || 0, published: body.published !== false, updatedAt: new Date() }).where(eq(testimonials.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("testimonials.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(testimonials).where(eq(testimonials.id, params.id));
  return NextResponse.json({ ok: true });
}
