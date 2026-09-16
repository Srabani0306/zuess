import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { permissions } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("roles.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const rows = await db.select().from(permissions).orderBy(asc(permissions.group), asc(permissions.label));
  return NextResponse.json(rows);
}
