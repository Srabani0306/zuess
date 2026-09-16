import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { navigationGroups, navigationItems } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";
import { ensureServicePage } from "@/lib/servicePages";

export async function POST(request) {
  try { await requirePermission("navigation.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.label || !body.href || !body.groupId) return NextResponse.json({ error: "Label, href and group are required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(navigationItems).values({ id, groupId: body.groupId, parentId: body.parentId || null, label: body.label, href: body.href, description: body.description || null, image: body.image || null, sortOrder: Number(body.sortOrder) || 0 });

  await ensureServicePage({ href: body.href, label: body.label, description: body.description });

  return NextResponse.json({ id }, { status: 201 });
}

export async function PUT(request) {
  try { await requirePermission("navigation.manage"); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
  const body = await request.json();
  if (!body.label) return NextResponse.json({ error: "Group label is required." }, { status: 400 });
  const id = crypto.randomUUID();
  await db.insert(navigationGroups).values({ id, label: body.label, slug: body.slug || body.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sortOrder: Number(body.sortOrder) || 0 });
  return NextResponse.json({ id }, { status: 201 });
}
