import { NextResponse } from "next/server";
import { getTeam } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getTeam());
}
