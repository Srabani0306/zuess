import { NextResponse } from "next/server";
import { getSocialLinks } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getSocialLinks());
}
