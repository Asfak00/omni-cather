import { NextRequest, NextResponse } from "next/server";
import { getContract } from "@/lib/store/contracts";
import { sendGhlEmail } from "@/lib/ghl/sync";
import { ghlConfig } from "@/lib/ghl/client";

/**
 * POST { contractId, subject, html } — relay a guest message
 * through the GHL conversations API. In demo mode (no creds)
 * the message only lives in the local discussion thread.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.contractId) {
    return NextResponse.json({ error: "contractId is required" }, { status: 400 });
  }
  const contract = await getContract(body.contractId);
  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  if (!ghlConfig().configured) {
    return NextResponse.json({ relayed: false, reason: "demo-mode" });
  }

  const relayed = await sendGhlEmail(
    contract.contactSnapshot,
    body.subject ?? "",
    body.html ?? ""
  );
  return NextResponse.json({ relayed });
}
