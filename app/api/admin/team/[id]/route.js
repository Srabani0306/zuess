import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import { teamMembers } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

const slugify = (value) => String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function PATCH(request, { params }) {
  try { await requirePermission("team.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  const slug = slugify(body.slug || body.name);
  if (!slug) return NextResponse.json({ error: "A valid slug is required." }, { status: 400 });
  const existing = await db.select({ id: teamMembers.id }).from(teamMembers).where(and(eq(teamMembers.slug, slug), ne(teamMembers.id, params.id))).limit(1);
  if (existing[0]) return NextResponse.json({ error: "A team member with this slug already exists." }, { status: 400 });
  await db.update(teamMembers).set({
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
    updatedAt: new Date(),
  }).where(eq(teamMembers.id, params.id));
  return NextResponse.json({ ok: true, slug });
}

export async function DELETE(request, { params }) {
  try { await requirePermission("team.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  await db.delete(teamMembers).where(eq(teamMembers.id, params.id));
  return NextResponse.json({ ok: true });
}
