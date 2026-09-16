import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { socialLinks } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("social_links.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder)));
}

export async function POST(request) {
  try { await requirePermission("social_links.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.platform || !body.url) return NextResponse.json({ error: "Platform and URL are required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(socialLinks).values({ id, platform: body.platform, url: body.url, sortOrder: body.sortOrder || 0, published: body.published !== false });
  return NextResponse.json({ id }, { status: 201 });
}
