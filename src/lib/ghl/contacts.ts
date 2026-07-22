import type { GHLContact } from "@/types";
import { ghlConfig, ghlFetch } from "./client";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";

interface GHLContactRaw {
  id: string;
  firstName?: string;
  lastName?: string;
  contactName?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  tags?: string[];
  source?: string;
  dateAdded?: string;
  type?: string;
}

interface GHLContactsResponse {
  contacts: GHLContactRaw[];
  meta?: { total?: number };
}

function normalize(raw: GHLContactRaw): GHLContact {
  const name =
    raw.contactName ||
    [raw.firstName, raw.lastName].filter(Boolean).join(" ") ||
    raw.email ||
    "Unnamed contact";
  return {
    id: raw.id,
    firstName: raw.firstName ?? "",
    lastName: raw.lastName ?? "",
    name,
    companyName: raw.companyName,
    email: raw.email,
    phone: raw.phone,
    address: raw.address1,
    city: raw.city,
    state: raw.state,
    tags: raw.tags ?? [],
    source: raw.source,
    dateAdded: raw.dateAdded,
    type: raw.type,
  };
}

/**
 * List contacts for the configured location. Falls back to local
 * mock data when GHL credentials are not configured so the app
 * remains fully navigable in development.
 */
export async function listContacts(query?: string): Promise<{
  contacts: GHLContact[];
  source: "ghl" | "mock";
}> {
  const { configured, locationId } = ghlConfig();

  if (!configured) {
    const q = query?.toLowerCase().trim();
    const contacts = q
      ? MOCK_CONTACTS.filter((c) =>
          [c.name, c.companyName, c.email, c.phone]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : MOCK_CONTACTS;
    return { contacts, source: "mock" };
  }

  const data = await ghlFetch<GHLContactsResponse>("/contacts/", {
    searchParams: {
      locationId: locationId!,
      limit: "100",
      ...(query ? { query } : {}),
    },
  });
  return { contacts: (data.contacts ?? []).map(normalize), source: "ghl" };
}

export async function getContact(id: string): Promise<GHLContact | null> {
  const { configured } = ghlConfig();
  if (!configured) {
    return MOCK_CONTACTS.find((c) => c.id === id) ?? null;
  }
  try {
    const data = await ghlFetch<{ contact: GHLContactRaw }>(`/contacts/${id}`);
    return normalize(data.contact);
  } catch {
    return null;
  }
}
