import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { banks } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("banks.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(banks).set({ name: body.name, logo: body.logo || null, sortOrder: body.sortOrder || 0, published: body.published !== false, updatedAt: new Date() }).where(eq(banks.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("banks.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(banks).where(eq(banks.id, params.id));
  return NextResponse.json({ ok: true });
}
