import type { Contract, GHLContact } from "@/types";
import { ghlConfig, ghlFetch } from "./client";
import { getContact } from "./contacts";
import { saveContract } from "@/lib/store/contracts";

/* ============================================================
 * Live sync with GoHighLevel.
 *
 * Everything the app shows about a contact is re-fetched from
 * GHL on every event page load (never a stale snapshot), guest
 * messages are relayed through GHL conversations, and contact
 * notes/activity from GHL are merged into the event Log.
 * Without credentials each call quietly no-ops so the app keeps
 * working in demo mode.
 * ============================================================ */

/**
 * Refresh the stored contact snapshot from GHL. Returns the
 * (possibly updated) contract. Called on event page loads so
 * contact edits made inside GHL show up here immediately.
 */
export async function syncContactSnapshot(contract: Contract): Promise<Contract> {
  if (!ghlConfig().configured) return contract;
  const fresh = await getContact(contract.contactId);
  if (!fresh) return contract;
  if (JSON.stringify(fresh) === JSON.stringify(contract.contactSnapshot)) {
    return contract;
  }
  return saveContract({ ...contract, contactSnapshot: fresh });
}

/**
 * Send a guest message through the GHL conversation API (Email).
 * Returns true when relayed to GHL, false in demo mode.
 */
export async function sendGhlEmail(
  contact: GHLContact,
  subject: string,
  html: string
): Promise<boolean> {
  if (!ghlConfig().configured || !contact.email) return false;
  try {
    await ghlFetch("/conversations/messages", {
      method: "POST",
      body: JSON.stringify({
        type: "Email",
        contactId: contact.id,
        subject,
        html,
        emailTo: contact.email,
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export interface GHLNote {
  id: string;
  body: string;
  dateAdded: string;
}

/** Contact notes from GHL — merged into the event Log tab. */
export async function fetchGhlNotes(contactId: string): Promise<GHLNote[]> {
  if (!ghlConfig().configured) return [];
  try {
    const data = await ghlFetch<{ notes: { id: string; body: string; dateAdded: string }[] }>(
      `/contacts/${contactId}/notes`
    );
    return (data.notes ?? []).map((n) => ({
      id: n.id,
      body: n.body,
      dateAdded: n.dateAdded,
    }));
  } catch {
    return [];
  }
}
