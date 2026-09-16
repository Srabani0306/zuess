import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages } from "@/lib/schema";

/* Top-level routes that already have their own dedicated page/route and should never be
   treated as an auto-manageable /services/[slug] page. */
const EXCLUDED_SLUGS = ["services", "about", "contact", "insights", "team", "home"];

export function deriveServiceSlug(href, label) {
  const slug = href?.startsWith("/services/")
    ? href.replace("/services/", "").split("#")[0]
    : String(label || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return slug && !EXCLUDED_SLUGS.includes(slug) ? slug : null;
}

/* Creates the page backing a nav item's link if nothing already lives at that slug. */
export async function ensureServicePage({ href, label, description }) {
  const slug = deriveServiceSlug(href, label);
  if (!slug) return;
  const existing = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, slug)).limit(1);
  if (existing[0]) return;
  await db.insert(pages).values({
    id: crypto.randomUUID(),
    slug,
    title: label,
    subtitle: "Service",
    description: description || `${label} service offered by Zuess Chartered Accountants.`,
    content: [],
    published: true,
  });
}

/* Keeps a nav item's backing page in sync when its href is edited. Renames the page that was
   sitting at the old slug to the new one (so previously authored content isn't orphaned) rather
   than silently leaving a dangling link, unless a page already occupies the new slug. */
export async function syncServicePageForHrefChange({ previousHref, nextHref, label, description }) {
  const nextSlug = deriveServiceSlug(nextHref, label);
  if (!nextSlug) return;

  const nextExists = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, nextSlug)).limit(1);
  if (nextExists[0]) return;

  const previousSlug = deriveServiceSlug(previousHref, label);
  if (previousSlug && previousSlug !== nextSlug) {
    const previousPage = await db.select({ id: pages.id }).from(pages).where(eq(pages.slug, previousSlug)).limit(1);
    if (previousPage[0]) {
      await db.update(pages).set({ slug: nextSlug, updatedAt: new Date() }).where(eq(pages.id, previousPage[0].id));
      return;
    }
  }

  await ensureServicePage({ href: nextHref, label, description });
}
