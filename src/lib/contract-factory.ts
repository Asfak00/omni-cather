import type { Contract, EventDocument, GHLContact, RestaurantSettings } from "@/types";

const DOC_NAMES: EventDocument["name"][] = [
  "Banquet Event Order",
  "Contract",
  "Invoice",
  "Kitchen Sheet",
  "Menu",
  "Proposal",
];

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function randomOrderNumber() {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999));
}

export function buildDefaultDocuments(): EventDocument[] {
  return DOC_NAMES.map((name) => ({
    id: randomId("doc"),
    name,
    format: "PDF",
    // BEO & Contract require signatures, the rest are informational
    status: name === "Banquet Event Order" || name === "Contract" ? "not_signed" : "n/a",
    shareable: name !== "Kitchen Sheet",
    linkable: true,
  }));
}

/** Create a fresh contract pre-filled from a GHL contact + restaurant settings */
export function createContractFromContact(
  contact: GHLContact,
  settings: RestaurantSettings
): Contract {
  const now = new Date().toISOString();
  return {
    id: randomId("ct"),
    orderNumber: randomOrderNumber(),
    eventId: randomOrderNumber(),
    contactId: contact.id,
    contactSnapshot: contact,
    additionalContactIds: [],

    eventName: contact.companyName
      ? `${contact.companyName} Event`
      : `${contact.name} Event`,
    bookingName: contact.companyName
      ? `${contact.companyName} Event`
      : `${contact.name} Event`,
    date: "",
    startTime: "18:00",
    endTime: "21:00",
    status: "PROSPECT",
    eventStyle: settings.eventStyles[0] ?? "On-Premise Event",
    eventType: settings.eventTypes[0] ?? "",
    areaIds: [],
    expectedGuests: 0,
    ownerId: settings.owners[0]?.id ?? "",
    ticketedEvent: false,

    specialInstructions: "",
    billingNotes: "",
    termsAndConditions: settings.defaultTerms,
    lineItems: [],
    billing: {
      salesTaxRate: settings.taxes.salesTaxRate,
      gratuityRate: settings.taxes.gratuityRate,
      adminFeeRate: settings.taxes.adminFeeRate,
      roomRental: 0,
      fbMinimum: 0,
      depositPercent: settings.defaultDepositPercent,
      depositPaid: false,
      transferFinancialsToEvent: true,
    },

    documents: buildDefaultDocuments(),
    createdAt: now,
    updatedAt: now,
  };
}
