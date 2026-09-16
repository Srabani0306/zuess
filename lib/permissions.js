/**
 * Canonical permission catalog. Shared by the seed script (scripts/setup-db.js, plain Node,
 * no "@/" alias) and the app (lib/auth/permissions.js), so there is exactly one place that
 * defines what a permission key means.
 *
 * Add a new permission by adding a row here, then re-run `npm run db:setup` — it upserts the
 * catalog and grants it to the Superadmin/Admin system roles automatically.
 */
export const PERMISSIONS = [
  { key: "pages.manage", label: "Manage pages", group: "Content" },
  { key: "navigation.manage", label: "Manage navigation", group: "Content" },
  { key: "testimonials.manage", label: "Manage testimonials", group: "Content" },
  { key: "banks.manage", label: "Manage associated banks", group: "Content" },
  { key: "media.manage", label: "Upload media", group: "Content" },
  { key: "enquiries.manage", label: "View & manage enquiries", group: "Operations" },
  { key: "news.manage", label: "Manage news ticker", group: "Content" },
  { key: "blog.manage", label: "Manage blog", group: "Content" },
  { key: "team.manage", label: "Manage team members", group: "Content" },
  { key: "social_links.manage", label: "Manage social media links", group: "Content" },
  { key: "roles.manage", label: "Manage roles & permissions", group: "Access control" },
  { key: "users.manage", label: "Manage staff users", group: "Access control" },
];

export const PERMISSION_KEYS = PERMISSIONS.map((permission) => permission.key);
