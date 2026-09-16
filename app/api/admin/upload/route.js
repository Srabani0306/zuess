import path from "node:path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/schema";
import { requireAdmin } from "@/lib/auth";
import { saveUploadedFile, StorageNotConfiguredError } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    try { await requireAdmin(); } catch { return NextResponse.json({ error: "Unauthorized." }, { status: 401 }); }
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file.arrayBuffer !== "function") return NextResponse.json({ error: "Image file is required." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files are supported." }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Images must be 5MB or smaller." }, { status: 400 });
    const id = crypto.randomUUID();
    const extension = path.extname(file.name) || ".bin";
    const filename = `${id}${extension}`;
    const url = await saveUploadedFile(file, filename);

    await db.insert(media).values({ id, filename: file.name, url, mimeType: file.type, alt: formData.get("alt")?.toString() || null });
    return NextResponse.json({ id, url }, { status: 201 });
  } catch (error) {
    console.error("Image upload failed:", error);
    if (error instanceof StorageNotConfiguredError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
