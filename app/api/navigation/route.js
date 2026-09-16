import { NextResponse } from "next/server";
import { getNavigation } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getNavigation());
}
