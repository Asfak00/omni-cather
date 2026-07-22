import { NextRequest, NextResponse } from "next/server";
import { getThemeSettings, saveThemeSettings } from "@/lib/store/settings";
import type { ThemeSettings } from "@/types";

export async function GET() {
  const theme = await getThemeSettings();
  return NextResponse.json({ theme });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as ThemeSettings | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const theme = await saveThemeSettings(body);
  return NextResponse.json({ theme });
}
