import "dotenv/config";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PERMISSIONS as PERMISSION_CATALOG } from "../lib/permissions.js";

const client = createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
const id = () => crypto.randomUUID();
const now = Date.now();

const statements = [
  `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'ADMIN', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, subtitle TEXT, description TEXT, hero_image TEXT, content TEXT NOT NULL DEFAULT '[]', published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS navigation_groups (id TEXT PRIMARY KEY, label TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, sort_order INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS navigation_items (id TEXT PRIMARY KEY, group_id TEXT NOT NULL REFERENCES navigation_groups(id) ON DELETE CASCADE, parent_id TEXT, label TEXT NOT NULL, href TEXT NOT NULL, icon TEXT, description TEXT, image TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS media (id TEXT PRIMARY KEY, filename TEXT NOT NULL, url TEXT NOT NULL, mime_type TEXT NOT NULL, alt TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS enquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, service TEXT NOT NULL, message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'NEW', is_read INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, link TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS blog_posts (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, excerpt TEXT, content TEXT NOT NULL, cover_image TEXT, author TEXT, tag TEXT, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT, company TEXT, quote TEXT NOT NULL, avatar TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS banks (id TEXT PRIMARY KEY, name TEXT NOT NULL, logo TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, is_system INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS permissions (id TEXT PRIMARY KEY, key TEXT NOT NULL UNIQUE, label TEXT NOT NULL, group_name TEXT NOT NULL DEFAULT 'General', created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS role_permissions (id TEXT PRIMARY KEY, role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE, permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS password_resets (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, used_at INTEGER, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS team_members (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, name TEXT NOT NULL, role TEXT NOT NULL, qualification TEXT, focus TEXT, experience_years INTEGER, bio TEXT, photo TEXT, email TEXT, phone TEXT, linkedin TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS blog_images (id TEXT PRIMARY KEY, blog_post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE, url TEXT NOT NULL, alt TEXT, sort_order INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS social_links (id TEXT PRIMARY KEY, platform TEXT NOT NULL, url TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS blog_likes (id TEXT PRIMARY KEY, blog_post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE, visitor_id TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS blog_likes_post_visitor_unique ON blog_likes (blog_post_id, visitor_id)`,
];

const PERMISSIONS = PERMISSION_CATALOG.map((permission) => [permission.key, permission.label, permission.group]);

const testimonialData = [
  ["Rohan Kulkarni", "Founder", "Kulkarni Textiles", "Zuess brought our GST filings and books current within a month and we haven't missed a deadline since.", 0],
  ["Meera Shastri", "Director", "Shastri Family Trust", "Clear answers, no jargon. Our audit findings are explained the way we'd explain them to each other.", 1],
  ["Arjun Bhandari", "CEO", "Bhandari Logistics", "One team handles our tax, compliance and advisory now instead of three separate consultants.", 2],
];

const pageData = [
  ["home", "Numbers you can build decisions on.", "Chartered Accountants · Bengaluru", "Taxation, audit, compliance and advisory handled by one practice.", [{ type: "hero", eyebrow: "What we handle", heading: "Four practices, one point of contact.", text: "Clear numbers, steady deadlines and an experienced team behind every decision." }, { type: "stats", heading: "A practice built for follow-through.", text: "18+ years of practical accounting experience." }]],
  ["about", "A steady hand behind the numbers.", "About Zuess", "We help founders, families and established companies stay clear, compliant and ready for what is next.", [{ type: "richText", heading: "Built around clarity", text: "Our practice brings together tax, audit, compliance and advisory under one accountable relationship." }]],
  ["services", "The work that keeps a business moving.", "Services", "From first registration to ongoing advisory, every service is designed around timely action.", [{ type: "cards", heading: "Our practice areas", text: "Choose a service area to begin a conversation." }]],
  ["team", "Experienced people. Direct answers.", "Our team", "Meet the partners who keep each engagement focused and useful.", [{ type: "richText", heading: "Partners who stay close to the work", text: "We combine technical knowledge with practical communication." }]],
  ["insights", "Notes for people who make the decisions.", "Insights", "Short, useful guidance on filings, finance and the details that matter.", [{ type: "richText", heading: "From the desk", text: "Practical notes you can use before the next deadline." }]],
  ["contact", "Tell us where your books stand today.", "Contact", "We reply to every enquiry within one business day.", [{ type: "contact", heading: "Start with a clear conversation", text: "Tell us what you need help with and our team will suggest next steps." }]],
  ["company-incorporation", "Company Incorporation Services", "Corporate Compliance", "Private limited, LLP or partnership registration handled end to end, including first compliance calendar.", [{ type: "split", kicker: "Corporate Compliance", heading: "Company Incorporation", text: "End-to-end entity setup, ROC registration, PAN, TAN, and statutory compliance setup." }, { type: "contact", heading: "Inquire about Company Incorporation", text: "Speak with our compliance team to start your entity registration." }]],
  ["gst-registration", "GST Registration & Returns", "Taxation", "Registration, monthly and annual GST returns, and reconciliation against purchase records.", [{ type: "split", kicker: "Taxation Desk", heading: "GST Registration & Compliance", text: "Timely GST registration, monthly GSTR-1 & 3B filings, and ITC reconciliation." }, { type: "contact", heading: "Need help with GST?", text: "Contact our GST desk for registration or filing assistance." }]],
  ["income-tax-filing", "Income Tax Filing & Planning", "Taxation", "Personal and business returns filed accurately with planning done before the year closes.", [{ type: "split", kicker: "Taxation Desk", heading: "Income Tax Filing & Advisory", text: "Comprehensive return filing, advance tax computation, and tax optimization." }, { type: "contact", heading: "Schedule a Tax Consultation", text: "Let us help you prepare your returns ahead of the filing deadline." }]],
  ["statutory-audit", "Statutory Audit & Assurance", "Audit & Assurance", "Independent audit under the Companies Act, delivered with enough lead time to fix findings before filing.", [{ type: "split", kicker: "Audit Desk", heading: "Statutory Audit", text: "Independent assurance for private and public companies under applicable accounting standards." }, { type: "contact", heading: "Schedule an Audit", text: "Reach out to our audit partners to discuss scope and timelines." }]],
  ["roc-filings", "ROC Annual Filings & Compliance", "Corporate Compliance", "Annual returns, financial statement filings and event-based ROC forms tracked so nothing is missed.", [{ type: "split", kicker: "Compliance Desk", heading: "ROC Annual Compliance", text: "MGT-7, AOC-4, and director disclosures filed directly with the Registrar of Companies." }, { type: "contact", heading: "ROC Filings Desk", text: "Keep your entity current with timely annual ROC filings." }]],
];

const navData = [
  ["services", "Services", 0],
  ["company", "Company", 1],
  ["resources", "Resources", 2],
];

async function main() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("TURSO_DATABASE_URL is required");
  for (const sql of statements) await client.execute(sql);
  try { await client.execute("ALTER TABLE users ADD COLUMN role_id TEXT REFERENCES roles(id)"); } catch { /* column already exists */ }
  try { await client.execute("ALTER TABLE enquiries ADD COLUMN is_read INTEGER NOT NULL DEFAULT 0"); } catch { /* column already exists */ }
  try { await client.execute("ALTER TABLE blog_posts ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0"); } catch { /* column already exists */ }

  for (const [key, label, group] of PERMISSIONS) {
    await client.execute({ sql: "INSERT INTO permissions (id,key,label,group_name,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(key) DO UPDATE SET label=excluded.label, group_name=excluded.group_name, updated_at=excluded.updated_at", args: [id(), key, label, group, now, now] });
  }
  const permissionRows = await client.execute("SELECT id,key FROM permissions");
  const permissionId = Object.fromEntries(permissionRows.rows.map((row) => [row.key, row.id]));

  const systemRoles = [
    ["Superadmin", "superadmin"],
    ["Admin", "admin"],
  ];
  const roleId = {};
  for (const [name, slug] of systemRoles) {
    await client.execute({ sql: "INSERT INTO roles (id,name,slug,is_system,created_at,updated_at) VALUES (?,?,?,1,?,?) ON CONFLICT(slug) DO UPDATE SET name=excluded.name, is_system=1, updated_at=excluded.updated_at", args: [id(), name, slug, now, now] });
  }
  const roleRows = await client.execute("SELECT id,slug FROM roles WHERE slug IN ('superadmin','admin')");
  for (const row of roleRows.rows) roleId[row.slug] = row.id;

  /* Superadmin and Admin hold every permission — see requirePermission() in lib/auth, which also
     grants them full access unconditionally so this stays true even if a permission is added later. */
  for (const slug of ["superadmin", "admin"]) {
    for (const key of PERMISSIONS.map(([permKey]) => permKey)) {
      await client.execute({ sql: "INSERT INTO role_permissions (id,role_id,permission_id,created_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id=? AND permission_id=?)", args: [id(), roleId[slug], permissionId[key], now, roleId[slug], permissionId[key]] });
    }
  }

  const password = process.env.SEED_ADMIN_PASSWORD || "ZuessAdmin!2026";
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@zuess.local").toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  await client.execute({ sql: "INSERT INTO users (id,name,email,password_hash,role,role_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(email) DO UPDATE SET password_hash=excluded.password_hash, role='SUPERADMIN', role_id=excluded.role_id, updated_at=excluded.updated_at", args: [id(), "Zuess Superadmin", email, passwordHash, "SUPERADMIN", roleId.superadmin, now, now] });

  for (const [slug, title, subtitle, description, content] of pageData) {
    await client.execute({ sql: "INSERT INTO pages (id,slug,title,subtitle,description,content,published,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?) ON CONFLICT(slug) DO NOTHING", args: [id(), slug, title, subtitle, description, JSON.stringify(content), now, now] });
  }
  for (const [slug, label, sortOrder] of navData) {
    await client.execute({ sql: "INSERT INTO navigation_groups (id,label,slug,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(slug) DO NOTHING", args: [id(), label, slug, sortOrder, now, now] });
  }
  const groups = await client.execute("SELECT id,slug FROM navigation_groups");
  const groupId = Object.fromEntries(groups.rows.map((row) => [row.slug, row.id]));
  const slugify = (label) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const items = [
    ["formation", groupId.services, null, "Formation", null, "Company and entity formation", 0],
    ["compliance", groupId.services, null, "Compliance", null, "Tax and filing compliance", 1],
    ["financial", groupId.services, null, "Financial Service", null, "Funding and finance support", 2],
    ["private-company", groupId.services, "formation", "Private Limited Company", null, "", 0],
    ["public-company", groupId.services, "formation", "Public Limited Company", null, "", 1],
    ["gst-registration", groupId.services, "formation", "GST Registration", null, "", 2],
    ["tax-related", groupId.services, "compliance", "Tax Related", null, "", 0],
    ["gst-return", groupId.services, "compliance", "GST Return", null, "Monthly, quarterly and annual returns", 1],
    ["annual-compliance", groupId.services, "compliance", "Annual Compliance of Company", null, "", 2],
    ["business-loan", groupId.services, "financial", "Business Loan", null, "Project loans, working capital and funding", 0],
    ["personal-loan", groupId.services, "financial", "Personal Loan", null, "Housing and personal finance", 1],
    ["secure-loan", groupId.services, "financial", "Secure Loan", null, "Asset-backed funding", 2],
    ["about", groupId.company, null, "About Us", "/about", "", 0],
    ["team", groupId.company, null, "Our Team", "/team", "", 1],
    ["insights", groupId.resources, null, "Insights", "/insights", "", 0],
    ["contact", groupId.resources, null, "Contact", "/contact", "", 1],
  ];
  const anyItems = await client.execute("SELECT id FROM navigation_items LIMIT 1");
  if (!anyItems.rows[0]) {
    for (const [slug, group, parentSlug, label, hrefOverride, description, sortOrder] of items) {
      const href = hrefOverride || `/services/${slugify(label)}`;
      const parent = parentSlug ? items.find((item) => item[0] === parentSlug) : null;
      const parentResult = parent ? await client.execute({ sql: "SELECT id FROM navigation_items WHERE group_id=? AND label=? LIMIT 1", args: [group, parent[3]] }) : { rows: [] };
      await client.execute({ sql: "INSERT INTO navigation_items (id,group_id,parent_id,label,href,description,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)", args: [id(), group, parentResult.rows[0]?.id || null, label, href, description, sortOrder, now, now] });
    }
  }
  for (const [name, role, company, quote, sortOrder] of testimonialData) {
    const existing = await client.execute({ sql: "SELECT id FROM testimonials WHERE name=? LIMIT 1", args: [name] });
    if (!existing.rows[0]) await client.execute({ sql: "INSERT INTO testimonials (id,name,role,company,quote,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)", args: [id(), name, role, company, quote, sortOrder, now, now] });
  }

  console.log(`Turso setup complete. Superadmin: ${email}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
