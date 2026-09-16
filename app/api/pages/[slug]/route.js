import { NextResponse } from "next/server";
import { getPage } from "@/lib/content";

export async function GET(request, { params }) {
  const page = await getPage(params.slug);
  if (!page || !page.published) return NextResponse.json({ error: "Page not found" }, { status: 404 });
  return NextResponse.json(page);
}
