import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function DELETE(request) {
  try { await requirePermission("enquiries.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length) return NextResponse.json({ error: "No enquiries selected." }, { status: 400 });
  await db.delete(enquiries).where(inArray(enquiries.id, ids));
  return NextResponse.json({ ok: true });
}
