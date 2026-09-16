import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogLikes, blogPosts } from "@/lib/schema";

const VISITOR_COOKIE = "zuess_visitor";

function getVisitorId() {
  return cookies().get(VISITOR_COOKIE)?.value || null;
}

function setVisitorCookie(id) {
  cookies().set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

async function findPublishedPost(slug) {
  const result = await db.select({ id: blogPosts.id, likeCount: blogPosts.likeCount }).from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))).limit(1);
  return result[0] || null;
}

export async function GET(request, { params }) {
  const post = await findPublishedPost(params.slug);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  const visitorId = getVisitorId();
  let liked = false;
  if (visitorId) {
    const existing = await db.select({ id: blogLikes.id }).from(blogLikes).where(and(eq(blogLikes.blogPostId, post.id), eq(blogLikes.visitorId, visitorId))).limit(1);
    liked = Boolean(existing[0]);
  }
  return NextResponse.json({ likeCount: post.likeCount, liked });
}

export async function POST(request, { params }) {
  const post = await findPublishedPost(params.slug);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });

  let visitorId = getVisitorId();
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    setVisitorCookie(visitorId);
  }

  const existing = await db.select({ id: blogLikes.id }).from(blogLikes).where(and(eq(blogLikes.blogPostId, post.id), eq(blogLikes.visitorId, visitorId))).limit(1);

  let liked;
  if (existing[0]) {
    await db.delete(blogLikes).where(eq(blogLikes.id, existing[0].id));
    await db.update(blogPosts).set({ likeCount: sql`${blogPosts.likeCount} - 1` }).where(eq(blogPosts.id, post.id));
    liked = false;
  } else {
    await db.insert(blogLikes).values({ id: crypto.randomUUID(), blogPostId: post.id, visitorId });
    await db.update(blogPosts).set({ likeCount: sql`${blogPosts.likeCount} + 1` }).where(eq(blogPosts.id, post.id));
    liked = true;
  }

  const updated = await db.select({ likeCount: blogPosts.likeCount }).from(blogPosts).where(eq(blogPosts.id, post.id)).limit(1);
  return NextResponse.json({ liked, likeCount: updated[0]?.likeCount ?? 0 });
}
