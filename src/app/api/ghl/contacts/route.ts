import { NextRequest, NextResponse } from "next/server";
import { listContacts } from "@/lib/ghl/contacts";
import { GHLError } from "@/lib/ghl/client";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? undefined;
  try {
    const { contacts, source } = await listContacts(query);
    return NextResponse.json({ contacts, source });
  } catch (err) {
    if (err instanceof GHLError) {
      return NextResponse.json(
        { error: err.message, details: err.body },
        { status: err.status }
      );
    }
    return NextResponse.json({ error: "Failed to load contacts" }, { status: 500 });
  }
}
