import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function PATCH(request, { params }) {
  try { await requirePermission("enquiries.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  await db.update(enquiries).set({ isRead: body.isRead !== false, updatedAt: new Date() }).where(eq(enquiries.id, params.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("enquiries.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(enquiries).where(eq(enquiries.id, params.id));
  return NextResponse.json({ ok: true });
}
