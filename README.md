# Zuess

A full-stack Next.js 14 and React CMS website. The public pages, page blocks, hero images, mega-menu groups, submenu items, and sub-submenu items are managed from the admin panel. Enquiries are persisted in Turso SQLite/libSQL.

## Stack

- Next.js 14 App Router and React 18
- JSX components with Tailwind CSS
- Turso SQLite/libSQL via `@libsql/client`
- Drizzle ORM and Drizzle Kit
- `bcryptjs` password hashing
- `jose` signed HTTP-only sessions
- Framer Motion and Lucide React

## Setup

Create a Turso database and token, then configure `.env`:

```env
TURSO_DATABASE_URL="libsql://your-database-your-org.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"
AUTH_SECRET="a-long-random-secret"
SEED_ADMIN_EMAIL="admin@zuess.local"
SEED_ADMIN_PASSWORD="ZuessAdmin!2026"
```

The example values are placeholders. Replace `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` with the real values from your Turso database before running the seeder or signing in. Restart the Next.js server after changing `.env`.

Run the app:

```bash
npm install
npm run db:setup
npm run dev
```

Open `http://localhost:3000`. Admin login is at `http://localhost:3000/admin/login`.

`npm run db:setup` creates all Turso tables, seeds the default pages and nested navigation, and upserts the superadmin. It is safe to run more than once; seeded records use conflict protection.

## Seed credentials

```text
Email:    admin@zuess.local
Password: ZuessAdmin!2026
Role:     SUPERADMIN
```

Change the two `SEED_ADMIN_*` values before seeding a shared environment. Passwords are bcrypt-hashed. Never use the example credentials in production and always replace `AUTH_SECRET`.

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm start         # Production server
npm run db:setup  # Create tables and seed CMS data
npm run db:push   # Push Drizzle schema changes to Turso
npm run db:studio # Open Drizzle Studio
```

## Open database and run server

### Turso dashboard

Open https://turso.tech, select your database, then use the database shell or SQL editor to inspect tables such as `users`, `pages`, `navigation_groups`, `navigation_items`, `media`, and `enquiries`.

### Turso CLI

After installing and authenticating the Turso CLI:

```bash
turso auth login
turso db list
turso db shell YOUR_DATABASE_NAME
```

Inside the shell:

```sql
.tables
SELECT email, role FROM users;
SELECT slug, title, published FROM pages;
SELECT label, href, parent_id FROM navigation_items;
```

### Start the Next.js server

```bash
npm run dev
```

Open `http://localhost:3000` or the port printed in the terminal. For production:

```bash
npm run build
npm start
```

### Run the seeder

Make sure `.env` contains valid `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, then run:

```bash
npm run db:seed
```

This creates the tables, default Zuess pages, nested navigation, and the superadmin account. The combined command is also available:

```bash
npm run db:setup
```

## CMS workflow

1. Sign in at `/admin/login`.
2. Use the left sidebar to open **Overview**, **Pages**, **Navigation**, **Testimonials**, **Associated Banks**, **Media**, or **Enquiries**.
3. In **Pages**, select an existing page, edit its title, subtitle, description, hero image, or content block JSON, then choose **Save changes**. Use **Add page** to create a new slug and page, or **Delete** to remove the selected page.
4. In **Navigation**, select an existing item in the tree to edit its label, URL, description, group, or parent. Choose **Update** to save it or **Delete** to remove it. To add a new submenu item, choose its group and select a parent. To add a sub-submenu item, select an existing submenu item as the parent. Use **Add navigation group** for a new top-level mega-menu column.
5. In **Testimonials**, click the `+` above the list (or an existing entry to edit it), fill in name, role, company and quote, optionally **Upload photo**, then **Add testimonial** / **Save changes**. Shows on the home page as "What our clients say" once at least one is published — the section is hidden entirely when empty.
6. In **Associated Banks**, click the `+` (or an existing entry), enter the bank name, optionally **Upload logo**, then save. Shows on the home page as "Associated banks" once at least one is published, with a "Show more" toggle past 6 entries; a bank with no logo yet falls back to showing its name as text.
7. In **Media**, use the image upload control inside the Pages, Testimonials, or Associated Banks editors. The API stores the uploaded file in `public/uploads` and records its URL in Turso. For production with multiple instances, replace this local storage step with S3, Cloudflare R2, Azure Blob Storage, or another durable object store.
8. The public navbar loads the database navigation at request time, and every public page loads its published page record from Turso. If CMS data is unavailable, the original static design remains visible.
9. The home page's EMI calculator is a self-contained client-side tool (loan amount/term/rate sliders, live monthly payment and a principal-vs-interest chart) — it is not admin-editable and involves no database, by design.

Content blocks currently support these JSON shapes:

```json
[
  { "type": "richText", "kicker": "From the desk", "heading": "Section heading", "text": "Section copy" },
  { "type": "cards", "heading": "Practice areas", "text": "Card introduction" },
  { "type": "contact", "heading": "Start a conversation", "text": "Contact introduction" }
]
```

The admin section editor can create multiple sections per page and provides these designs: `richText`, `split`, `cards`, `quote`, `stats`, and `contact`. Each section has its own title, subtitle/kicker, description, image URL, and upload control. Add, remove, reorder later, or change a section's design before saving the page.

## API endpoints

The endpoint registry is kept in `lib/endpoints.js`; the complete route reference is in `docs/API.md`.

- `POST /api/auth/login` signs in an admin.
- `POST /api/auth/logout` clears the session.
- `GET /api/auth/me` checks the current session.
- `POST /api/enquiries` creates a public enquiry.
- `GET /api/enquiries` lists enquiries for admins.
- `GET /api/navigation` returns nested public navigation.
- `GET /api/pages/:slug` returns one published page.
- `GET /api/testimonials` returns published testimonials.
- `GET /api/banks` returns published associated banks.
- `GET /api/admin/pages` lists pages for admins.
- `POST /api/admin/pages` creates a page.
- `PATCH /api/admin/pages/:id` updates a page.
- `POST /api/admin/navigation` adds a nested menu item or group.
- `POST /api/admin/upload` validates and uploads an image.
- `GET/POST /api/admin/testimonials`, `PATCH/DELETE /api/admin/testimonials/:id` manage testimonials.
- `GET/POST /api/admin/banks`, `PATCH/DELETE /api/admin/banks/:id` manage associated banks.

All `/api/admin/*` endpoints require a valid admin session. Image uploads are limited to image MIME types and 5MB.

## Folder structure

```text
app/
  admin/login/page.js             # Superadmin login
  admin/page.js                   # Protected CMS and enquiry dashboard
  api/                            # Route handlers
    auth/                         # Login, logout, session
    admin/pages/                  # Page CRUD
    admin/navigation/             # Nested navigation writes
    admin/testimonials/           # Testimonial CRUD
    admin/banks/                  # Associated bank CRUD
    admin/upload/                 # Image upload
    enquiries/                    # Public create/admin list
    navigation/                   # Public nested menu read
    pages/[slug]/                 # Public page API
    testimonials/                 # Public testimonials read
    banks/                        # Public associated banks read
  page.js                         # Home page (banner, services, EMI
                                   #   calculator, testimonials, banks, ...)
  about, services, team,
  insights, contact/page.js       # Turso-backed public pages
  layout.js                       # Loads dynamic navigation
components/
  AdminWorkspace.jsx              # Full admin UI: pages, navigation,
                                   #   testimonials, banks, media, enquiries
  AdminDashboard.jsx              # Thin wrapper that renders AdminWorkspace
  CmsPage.jsx                     # JSON block renderer
  EnquiryForm.jsx                 # Client enquiry form
  Navbar.jsx                      # Database-driven mega-menu
  EmiCalculator.jsx               # Home page loan EMI tool (client-only, no DB)
  AssociatedBanks.jsx             # Home page bank logo grid + "Show more"
lib/
  db.js                           # Turso/libSQL client
  schema.js                       # Drizzle tables
  content.js                      # Page/navigation/testimonials/banks queries
  endpoints.js                    # Endpoint registry
  auth.js                         # Signed admin sessions
  data.js                         # Legacy visual reference data
scripts/
  setup-db.js                     # Turso tables and seed data
public/uploads/                   # Development image upload target
drizzle.config.js
.env.example
```

## Turso notes

Turso is SQLite-compatible but remote. The application does not use Prisma or a local database anymore. `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are required for database-backed pages. Use a Turso branch for staging and run `npm run db:setup` against that branch before testing.

## Deployment notes

Use durable object storage for uploaded images in production, configure all environment variables in the host, run `npm run db:setup` once against the target Turso database, then run `npm run build`. Add rate limiting, CSRF protection for any cross-site deployment, audit logs, and email notifications before exposing the admin and enquiry APIs at scale.
