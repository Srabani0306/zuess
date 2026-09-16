import { and, asc, desc, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { banks, blogImages, blogPosts, navigationGroups, navigationItems, news, pages, socialLinks, teamMembers, testimonials } from "@/lib/schema";

export async function getPage(slug) {
  try {
    const result = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
    return result[0] || null;
  } catch {
    return null;
  }
}

export async function getPages() {
  return db.select().from(pages).orderBy(asc(pages.slug));
}

export async function getTestimonials() {
  try {
    return await db.select().from(testimonials).where(eq(testimonials.published, true)).orderBy(asc(testimonials.sortOrder));
  } catch {
    return [];
  }
}

export async function getBanks() {
  try {
    return await db.select().from(banks).where(eq(banks.published, true)).orderBy(asc(banks.sortOrder));
  } catch {
    return [];
  }
}

export async function getNews() {
  try {
    return await db.select().from(news).where(eq(news.published, true)).orderBy(asc(news.createdAt));
  } catch {
    return [];
  }
}

export async function getBlogPosts() {
  try {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt));
  } catch {
    return [];
  }
}

export async function getBlogPost(slug) {
  try {
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    const post = result[0]?.published ? result[0] : null;
    if (!post) return null;
    const images = await db.select().from(blogImages).where(eq(blogImages.blogPostId, post.id)).orderBy(asc(blogImages.sortOrder));
    return { ...post, images };
  } catch {
    return null;
  }
}

export async function getRecentBlogPosts(limit = 5) {
  try {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt)).limit(limit);
  } catch {
    return [];
  }
}

export async function getPopularBlogPosts(limit = 5) {
  try {
    return await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.likeCount), desc(blogPosts.createdAt)).limit(limit);
  } catch {
    return [];
  }
}

export async function getTrendingBlogPosts(limit = 5) {
  try {
    return await db.select().from(blogPosts).where(and(eq(blogPosts.published, true), gt(blogPosts.likeCount, 0))).orderBy(desc(blogPosts.createdAt)).limit(limit);
  } catch {
    return [];
  }
}

export async function getBlogTags() {
  try {
    const rows = await db.select({ tag: blogPosts.tag }).from(blogPosts).where(eq(blogPosts.published, true));
    return [...new Set(rows.map((row) => row.tag).filter(Boolean))];
  } catch {
    return [];
  }
}

export async function getTeam() {
  try {
    return await db.select().from(teamMembers).where(eq(teamMembers.published, true)).orderBy(asc(teamMembers.sortOrder));
  } catch {
    return [];
  }
}

export async function getTeamMember(slug) {
  try {
    const result = await db.select().from(teamMembers).where(eq(teamMembers.slug, slug)).limit(1);
    return result[0]?.published ? result[0] : null;
  } catch {
    return null;
  }
}

export async function getSocialLinks() {
  try {
    return await db.select().from(socialLinks).where(eq(socialLinks.published, true)).orderBy(asc(socialLinks.sortOrder));
  } catch {
    return [];
  }
}

export async function getNavigation() {
  let groups;
  let items;
  try {
    [groups, items] = await Promise.all([
      db.select().from(navigationGroups).orderBy(asc(navigationGroups.sortOrder)),
      db.select().from(navigationItems).orderBy(asc(navigationItems.sortOrder)),
    ]);
  } catch {
    return [];
  }

  const buildTree = (groupId, parentId = null) => {
    return items
      .filter((item) => item.groupId === groupId && (item.parentId === parentId || (!parentId && !item.parentId)))
      .map((item) => ({
        ...item,
        children: buildTree(groupId, item.id),
      }));
  };

  return groups.map((group) => ({
    ...group,
    items: buildTree(group.id, null),
  }));
}
