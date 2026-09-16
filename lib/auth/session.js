import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const COOKIE_NAME = "zuess_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "development-only-change-me"
);

/**
 * Issues the signed JWT session cookie. `user.permissions` (a flat array of permission keys,
 * resolved by getUserPermissions() at login time) is baked into the token so every subsequent
 * request can authorize without a DB round trip.
 */
export async function createSession(user) {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    roleId: user.roleId || null,
    roleName: user.roleName || null,
    permissions: user.permissions || [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { expires: new Date(0), path: "/" });
}
