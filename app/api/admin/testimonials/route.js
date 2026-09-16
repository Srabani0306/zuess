import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("testimonials.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(testimonials).orderBy(asc(testimonials.sortOrder)));
}

export async function POST(request) {
  try { await requirePermission("testimonials.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.name || !body.quote) return NextResponse.json({ error: "Name and quote are required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(testimonials).values({ id, name: body.name, role: body.role || null, company: body.company || null, quote: body.quote, avatar: body.avatar || null, sortOrder: body.sortOrder || 0, published: body.published !== false });
  return NextResponse.json({ id }, { status: 201 });
}
