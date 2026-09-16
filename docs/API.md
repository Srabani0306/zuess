# API Reference

All request and response bodies use JSON unless noted. Admin routes require the `zuess_session` HTTP-only cookie created by login.

## Authentication

### `POST /api/auth/login`

Body: `{ "email": "admin@example.com", "password": "..." }`

Returns the authenticated user and sets an 8-hour signed session cookie.

### `POST /api/auth/logout`

Clears the session cookie.

### `GET /api/auth/me`

Returns the signed-in user or `401`.

## Public content

### `GET /api/pages/:slug`

Returns a published page with `title`, `subtitle`, `description`, `heroImage`, and JSON `content` blocks.

### `GET /api/navigation`

Returns navigation groups with `items` and each item's nested `children`.

### `POST /api/enquiries`

Body: `{ "name", "email", "phone", "service", "message" }`.

Creates a new `NEW` enquiry.

### `GET /api/testimonials`

Returns published testimonials (`name`, `role`, `company`, `quote`, `avatar`), ordered by `sortOrder`.

### `GET /api/banks`

Returns published associated banks (`name`, `logo`), ordered by `sortOrder`.

## Admin content

### `GET /api/admin/pages`

Returns all pages.

### `POST /api/admin/pages`

Body: `{ "slug", "title", "subtitle", "description", "heroImage", "content", "published" }`.

Creates a page.

### `PATCH /api/admin/pages/:id`

Updates page fields. `content` must be an array of supported block objects.

### `POST /api/admin/navigation`

For a nested menu item, send `{ "groupId", "parentId", "label", "href", "description", "image", "sortOrder" }`. Set `parentId` to `null` for a top-level item. For a new group, send `{ "label", "slug", "sortOrder" }` with `PUT`.

### `POST /api/admin/upload`

Multipart form data with `file` and optional `alt`. Accepts image MIME types up to 5MB. Development writes to `public/uploads`; Vercel deployments require `BLOB_READ_WRITE_TOKEN` and use Vercel Blob. Both modes create a media record in Turso.

### `GET /api/admin/testimonials` / `POST /api/admin/testimonials`

Lists all testimonials (any `published` state), or creates one. Body: `{ "name", "role", "company", "quote", "avatar", "sortOrder", "published" }`. `name` and `quote` are required.

### `PATCH /api/admin/testimonials/:id` / `DELETE /api/admin/testimonials/:id`

Updates or deletes a testimonial.

### `GET /api/admin/banks` / `POST /api/admin/banks`

Lists all banks (any `published` state), or creates one. Body: `{ "name", "logo", "sortOrder", "published" }`. `name` is required.

### `PATCH /api/admin/banks/:id` / `DELETE /api/admin/banks/:id`

Updates or deletes a bank.

## Error format

Errors return `{ "error": "Human-readable message" }` with an appropriate `4xx` or `5xx` status.
