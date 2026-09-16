import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { asc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogImages, blogPosts } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const images = await db.select().from(blogImages).where(eq(blogImages.blogPostId, params.id)).orderBy(asc(blogImages.sortOrder));
  return NextResponse.json(images);
}

export async function POST(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }

  const post = await db.select({ id: blogPosts.id }).from(blogPosts).where(eq(blogPosts.id, params.id)).limit(1);
  if (!post[0]) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5MB or smaller." }, { status: 400 });

  const id = crypto.randomUUID();
  const extension = path.extname(file.name) || ".bin";
  const filename = `${id}${extension}`;
  await mkdir(path.join(process.cwd(), "public", "uploads"), { recursive: true });
  await writeFile(path.join(process.cwd(), "public", "uploads", filename), Buffer.from(await file.arrayBuffer()));
  const url = `/uploads/${filename}`;

  const rows = await db.select({ nextOrder: max(blogImages.sortOrder) }).from(blogImages).where(eq(blogImages.blogPostId, params.id));
  const sortOrder = (rows[0]?.nextOrder ?? -1) + 1;
  await db.insert(blogImages).values({ id, blogPostId: params.id, url, alt: formData.get("alt")?.toString() || null, sortOrder });

  return NextResponse.json({ id, url }, { status: 201 });
}
