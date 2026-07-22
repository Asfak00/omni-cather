import { NextRequest, NextResponse } from "next/server";
import { listContracts, saveContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { getContact } from "@/lib/ghl/contacts";
import { createContractFromContact } from "@/lib/contract-factory";

export async function GET() {
  const contracts = await listContracts();
  return NextResponse.json({ contracts });
}

/**
 * POST { contactId } → create a draft contract from a GHL contact.
 * Returns an existing draft for the contact if one already exists,
 * so "Make Contract" is idempotent from the contacts list.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const contactId: string | undefined = body?.contactId;
  if (!contactId) {
    return NextResponse.json({ error: "contactId is required" }, { status: 400 });
  }

  const contact = await getContact(contactId);
  if (!contact) {
    return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  }

  const existing = (await listContracts()).find(
    (c) => c.contactId === contactId && c.status === "PROSPECT"
  );
  if (existing && body?.reuseDraft !== false) {
    return NextResponse.json({ contract: existing, created: false });
  }

  const settings = await getRestaurantSettings();
  const contract = await saveContract(createContractFromContact(contact, settings));
  return NextResponse.json({ contract, created: true }, { status: 201 });
}
