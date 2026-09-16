import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const hasPlaceholderCredentials = !url || url.includes("your-database") || !authToken || authToken.includes("your-turso-auth-token");

if (hasPlaceholderCredentials) {
  console.warn("Turso is not configured. Add a real TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to .env.");
}

// Next.js patches the global fetch() to cache responses by default. @libsql/client's
// HTTP transport runs its queries through fetch(), so without this override every
// Turso query gets treated as a cacheable request and admin edits stop showing up
// until the cache is invalidated. Force every DB request to bypass that cache.
const noStoreFetch = (input, init) => fetch(input, { ...init, cache: "no-store" });

const client = createClient({
  url: url || "file:local.db",
  authToken,
  fetch: noStoreFetch,
});

export const db = drizzle(client);
export { client as tursoClient };
export { hasPlaceholderCredentials };
