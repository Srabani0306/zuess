import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/schema";
import { requirePermission } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const required = ["name", "email", "phone", "service", "message"];
    if (required.some((field) => !String(body[field] || "").trim())) {
      return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db.insert(enquiries).values({
      id,
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      service: body.service.trim(),
      message: body.message.trim(),
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to save your enquiry." }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requirePermission("enquiries.manage");
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const result = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  return NextResponse.json(result);
}
