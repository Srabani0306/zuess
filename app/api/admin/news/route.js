import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { news } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("news.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(news).orderBy(asc(news.createdAt)));
}

export async function POST(request) {
  try { await requirePermission("news.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(news).values({ id, title: body.title, link: body.link || null, sortOrder: body.sortOrder || 0, published: body.published !== false });
  return NextResponse.json({ id }, { status: 201 });
}
