import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { banks } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("banks.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(banks).orderBy(asc(banks.sortOrder)));
}

export async function POST(request) {
  try { await requirePermission("banks.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(banks).values({ id, name: body.name, logo: body.logo || null, sortOrder: body.sortOrder || 0, published: body.published !== false });
  return NextResponse.json({ id }, { status: 201 });
}
