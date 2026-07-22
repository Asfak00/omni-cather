import type { DocAudience, DocName } from "@/types";

/**
 * Static metadata for the generated document set. Each document
 * extracts a different slice of the contract for its audience:
 *  - Kitchen Sheet   → kitchen team (food prep, no prices)
 *  - Banquet Event Order → staff / operations (full run sheet)
 *  - Contract        → manager & client (terms + signatures)
 *  - Invoice         → client billing (itemized charges)
 *  - Menu            → client (dishes & descriptions)
 *  - Proposal        → client (offer summary)
 */
export const DOC_META: Record<
  DocName,
  { slug: string; audience: DocAudience; description: string }
> = {
  "Banquet Event Order": {
    slug: "banquet-event-order",
    audience: "Staff",
    description: "Operations run sheet: timeline, areas, items, instructions",
  },
  Contract: {
    slug: "contract",
    audience: "Manager",
    description: "Agreement with billing summary, terms & signature lines",
  },
  Invoice: {
    slug: "invoice",
    audience: "Billing",
    description: "Itemized charges, taxes, fees, deposit & amount due",
  },
  "Kitchen Sheet": {
    slug: "kitchen-sheet",
    audience: "Kitchen",
    description: "Food prep list with quantities and prep notes — no prices",
  },
  Menu: {
    slug: "menu",
    audience: "Client",
    description: "Selected dishes and drinks with descriptions",
  },
  Proposal: {
    slug: "proposal",
    audience: "Client",
    description: "Event offer with estimated totals",
  },
};

export const SLUG_TO_DOC_NAME: Record<string, DocName> = Object.fromEntries(
  Object.entries(DOC_META).map(([name, meta]) => [meta.slug, name as DocName])
);

export function docPdfUrl(contractId: string, name: DocName): string {
  return `/api/contracts/${contractId}/pdf/${DOC_META[name].slug}`;
}
