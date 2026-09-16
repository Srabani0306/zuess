import { NextResponse } from "next/server";
import { eq, and, ne, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogImages, blogPosts } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const result = await db.select().from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);
  if (!result[0]) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  const images = await db.select().from(blogImages).where(eq(blogImages.blogPostId, params.id)).orderBy(asc(blogImages.sortOrder));
  return NextResponse.json({ ...result[0], images });
}

export async function PATCH(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  const slug = slugify(body.slug || body.title);
  if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
  const existing = await db.select({ id: blogPosts.id }).from(blogPosts).where(and(eq(blogPosts.slug, slug), ne(blogPosts.id, params.id))).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A blog post with this slug already exists." }, { status: 400 });
  await db.update(blogPosts).set({
    slug,
    title: body.title,
    excerpt: body.excerpt || null,
    content: body.content,
    coverImage: body.coverImage || null,
    author: body.author || null,
    tag: body.tag || null,
    published: body.published !== false,
    updatedAt: new Date(),
  }).where(eq(blogPosts.id, params.id));
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(blogPosts).where(eq(blogPosts.id, params.id));
  return NextResponse.json({ ok: true });
}
