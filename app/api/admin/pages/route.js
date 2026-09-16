import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try { await requirePermission("pages.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(pages).orderBy(asc(pages.slug)));
}

export async function POST(request) {
  try { await requirePermission("pages.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.slug || !body.title) return NextResponse.json({ error: "Slug and title are required." }, { status: 400 });
  const slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) return NextResponse.json({ error: "Slug must contain at least one letter or number." }, { status: 400 });
  const existing = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
  if (existing[0]) return NextResponse.json({ error: `A page with the slug "${slug}" already exists.` }, { status: 409 });
  const id = crypto.randomUUID();
  await db.insert(pages).values({ id, slug, title: body.title, subtitle: body.subtitle || null, description: body.description || null, heroImage: body.heroImage || null, content: body.content || [], published: body.published !== false });
  return NextResponse.json({ id, slug }, { status: 201 });
}
