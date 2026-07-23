import { NextResponse } from "next/server";
import { writeStore } from "@/lib/store/file-store";
import { getRestaurantSettings } from "@/lib/store/settings";
import { buildDemoContracts } from "@/lib/store/demo-data";

/** POST /api/demo — (re)load the demo events. Overwrites current events. */
export async function POST() {
  const settings = await getRestaurantSettings();
  const contracts = buildDemoContracts(settings);
  await writeStore("contracts", contracts);
  return NextResponse.json({ ok: true, count: contracts.length });
}

/** DELETE /api/demo — clear all events (empty list, no re-seed). */
export async function DELETE() {
  await writeStore("contracts", []);
  return NextResponse.json({ ok: true });
}
