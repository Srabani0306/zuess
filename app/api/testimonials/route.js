import { NextResponse } from "next/server";
import { getTestimonials } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getTestimonials());
}
