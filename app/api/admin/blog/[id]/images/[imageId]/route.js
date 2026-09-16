import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogImages } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function DELETE(request, { params }) {
  try { await requirePermission("blog.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(blogImages).where(and(eq(blogImages.id, params.imageId), eq(blogImages.blogPostId, params.id)));
  return NextResponse.json({ ok: true });
}
