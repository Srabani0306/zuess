import { NextResponse } from "next/server";
import { getBanks } from "@/lib/content";

export async function GET() {
  return NextResponse.json(await getBanks());
}
