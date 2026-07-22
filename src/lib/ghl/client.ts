/* ============================================================
 * GoHighLevel API client (server-side only)
 *
 * Uses the LeadConnector v2 API. Configure via env:
 *   GHL_API_KEY      — Private Integration token (pit-...)
 *   GHL_LOCATION_ID  — sub-account / location id
 *
 * When credentials are missing the app falls back to local
 * mock data so the full flow can be developed & demoed.
 * ============================================================ */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_API_VERSION = "2021-07-28";

export function ghlConfig() {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  return {
    apiKey,
    locationId,
    configured: Boolean(apiKey && locationId),
  };
}

export class GHLError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "GHLError";
  }
}

export async function ghlFetch<T>(
  path: string,
  init: RequestInit & { searchParams?: Record<string, string> } = {}
): Promise<T> {
  const { apiKey, configured } = ghlConfig();
  if (!configured) {
    throw new GHLError("GHL credentials are not configured", 503);
  }

  const url = new URL(`${GHL_BASE_URL}${path}`);
  for (const [k, v] of Object.entries(init.searchParams ?? {})) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_API_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
    // GHL data changes often; never cache on the server
    cache: "no-store",
  });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text().catch(() => undefined);
    }
    throw new GHLError(`GHL request failed: ${res.status} ${path}`, res.status, body);
  }

  return (await res.json()) as T;
}

/** Deep links into the GHL app for share / email actions */
export function ghlAppLinks(contactId?: string) {
  const { locationId } = ghlConfig();
  const base = `https://app.gohighlevel.com/v2/location/${locationId ?? "YOUR_LOCATION_ID"}`;
  return {
    contact: contactId ? `${base}/contacts/detail/${contactId}` : `${base}/contacts`,
    documents: `${base}/payments/proposals-estimates`,
    invoices: `${base}/payments/invoices`,
    conversations: contactId
      ? `${base}/conversations/conversations/${contactId}`
      : `${base}/conversations`,
  };
}
