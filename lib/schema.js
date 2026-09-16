import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
};

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  roleId: text("role_id").references(() => roles.id, { onDelete: "set null" }),
  ...timestamps,
});

export const roles = sqliteTable("roles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const permissions = sqliteTable("permissions", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  label: text("label").notNull(),
  group: text("group_name").notNull().default("General"),
  ...timestamps,
});

export const rolePermissions = sqliteTable("role_permissions", {
  id: text("id").primaryKey(),
  roleId: text("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: text("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const passwordResets = sqliteTable("password_resets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  heroImage: text("hero_image"),
  content: text("content", { mode: "json" }).$type([]).notNull().default([]),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const navigationGroups = sqliteTable("navigation_groups", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const navigationItems = sqliteTable("navigation_items", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull().references(() => navigationGroups.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  label: text("label").notNull(),
  href: text("href").notNull(),
  icon: text("icon"),
  description: text("description"),
  image: text("image"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

export const media = sqliteTable("media", {
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  mimeType: text("mime_type").notNull(),
  alt: text("alt"),
  ...timestamps,
});

export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  quote: text("quote").notNull(),
  avatar: text("avatar"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const banks = sqliteTable("banks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  service: text("service").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("NEW"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  ...timestamps,
});

export const news = sqliteTable("news", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  author: text("author"),
  tag: text("tag"),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  likeCount: integer("like_count").notNull().default(0),
  ...timestamps,
});

export const blogImages = sqliteTable("blog_images", {
  id: text("id").primaryKey(),
  blogPostId: text("blog_post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
});

export const teamMembers = sqliteTable("team_members", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  qualification: text("qualification"),
  focus: text("focus"),
  experienceYears: integer("experience_years"),
  bio: text("bio"),
  photo: text("photo"),
  email: text("email"),
  phone: text("phone"),
  linkedin: text("linkedin"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const socialLinks = sqliteTable("social_links", {
  id: text("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  ...timestamps,
});

export const blogLikes = sqliteTable("blog_likes", {
  id: text("id").primaryKey(),
  blogPostId: text("blog_post_id").notNull().references(() => blogPosts.id, { onDelete: "cascade" }),
  visitorId: text("visitor_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  uniqueVisitorLike: uniqueIndex("blog_likes_post_visitor_unique").on(table.blogPostId, table.visitorId),
}));
