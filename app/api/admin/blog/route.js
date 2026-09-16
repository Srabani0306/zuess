import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET() {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt)));
}

export async function POST(request) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.title || !body.content) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  const slug = slugify(body.slug || body.title);
  if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
  const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A blog post with this slug already exists." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(blogPosts).values({
    id,
    slug,
    title: body.title,
    excerpt: body.excerpt || null,
    content: body.content,
    coverImage: body.coverImage || null,
    author: body.author || null,
    tag: body.tag || null,
    published: body.published !== false,
  });
  return NextResponse.json({ id, slug }, { status: 201 });
}
