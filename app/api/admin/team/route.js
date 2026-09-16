import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function GET() {
  try { await requirePermission("team.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  return NextResponse.json(await db.select().from(teamMembers).orderBy(asc(teamMembers.sortOrder)));
}

export async function POST(request) {
  try { await requirePermission("team.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.name || !body.role) return NextResponse.json({ error: "Name and role are required." }, { status: 400 });
  const slug = slugify(body.slug || body.name);
  if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
  const existing = await db.select({ id: teamMembers.id }).from(teamMembers).where(eq(teamMembers.slug, slug)).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A team member with this slug already exists." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(teamMembers).values({
    id,
    slug,
    name: body.name,
    role: body.role,
    qualification: body.qualification || null,
    focus: body.focus || null,
    experienceYears: body.experienceYears ? Number(body.experienceYears) : null,
    bio: body.bio || null,
    photo: body.photo || null,
    email: body.email || null,
    phone: body.phone || null,
    linkedin: body.linkedin || null,
    sortOrder: body.sortOrder || 0,
    published: body.published !== false,
  });
  return NextResponse.json({ id, slug }, { status: 201 });
}
