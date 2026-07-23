import { NextRequest, NextResponse } from "next/server";
import {
  getRestaurantSettings,
  saveRestaurantSettings,
} from "@/lib/store/settings";
import { syncSettingsToGhl } from "@/lib/ghl/sync";
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
  // mirror the settings into a GHL custom value (no-op in demo mode)
  const ghlSynced = await syncSettingsToGhl(settings);
  return NextResponse.json({ settings, ghlSynced });
}
