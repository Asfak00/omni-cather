import { NextRequest, NextResponse } from "next/server";
import {
  getRestaurantSettings,
  saveRestaurantSettings,
} from "@/lib/store/settings";
import type { RestaurantSettings } from "@/types";

export async function GET() {
  const settings = await getRestaurantSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as RestaurantSettings | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const settings = await saveRestaurantSettings(body);
  return NextResponse.json({ settings });
}
