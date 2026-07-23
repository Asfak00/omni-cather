/* ============================================================
 * Core domain types for the GHL Event Manager
 * ============================================================ */

/** A contact synced from GoHighLevel */
export interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  tags?: string[];
  source?: string;
  dateAdded?: string;
  /** e.g. "lead", "customer" */
  type?: string;
}

/* ---------------- Event / Contract ---------------- */

export type EventStatus =
  | "PROSPECT"
  | "TENTATIVE"
  | "DEFINITE"
  | "CLOSED"
  | "LOST";

export type LineItemCategory =
  | "Audio/Visual"
  | "Beverage"
  | "Food"
  | "Labor"
  | "Misc";

export type ApplicableCharge = "Admin Fee" | "Gratuity" | "Sales Tax";

export type LineItemSection = "food" | "beverage" | "other";

export interface LineItemDiscount {
  type: "percent" | "amount";
  value: number;
}

export interface ContractLineItem {
  id: string;
  section: LineItemSection;
  qty: number;
  description: string;
  /** longer alternate description shown on docs */
  altDescription?: string;
  price: number;
  category: LineItemCategory | "";
  /** which charges apply to this item */
  applicableCharges: ApplicableCharge[];
  discount?: LineItemDiscount | null;
  /** if the row was added from a saved menu item */
  menuItemId?: string;
}

/** Extra fee row added via "Add a Row" in the billing widget */
export interface CustomCharge {
  id: string;
  label: string;
  mode: "percent" | "amount"; // percent of subtotal, or flat amount
  value: number;
}

/** Per-charge advanced settings ("..." row expander) */
export interface ChargeSettings {
  /** compound: also tax the totals of these other charges */
  includeFrom: ApplicableCharge[];
  /** show the row but keep it out of the grand total */
  excludeFromTotals: boolean;
}

export interface BillingSettings {
  salesTaxRate: number; // percent
  gratuityRate: number; // percent
  adminFeeRate: number; // percent
  roomRental: number; // flat amount
  fbMinimum: number; // food & beverage minimum
  depositPercent: number; // percent of grand total, or flat amount (see depositMode)
  depositMode?: "percent" | "amount";
  depositPaid: boolean;
  depositDueDate?: string;
  balanceDueDate?: string;
  transferFinancialsToEvent: boolean;
  customCharges?: CustomCharge[];
  chargeSettings?: Partial<Record<ApplicableCharge, ChargeSettings>>;
  /** display order of the charge rows (builtin names + custom ids) */
  chargeOrder?: string[];
}

export interface ContractTotals {
  foodTotal: number;
  beverageTotal: number;
  otherTotal: number;
  /** breakdown by line-item category (Food, Beverage, Misc, ...) */
  categoryTotals: { category: string; total: number }[];
  subtotal: number;
  salesTax: number;
  gratuity: number;
  adminFee: number;
  customChargeTotals: { id: string; label: string; total: number }[];
  roomRental: number;
  fbMinimumMet: boolean;
  grandTotal: number;
  deposit: number;
  paid: number;
  remaining: number;
  pricePerPerson: number;
  estimatedAmountDue: number;
}

/* -- event activity -- */

export interface StatusChange {
  from?: EventStatus;
  to: EventStatus;
  at: string; // ISO
  by: string;
}

export interface PaymentRecord {
  id: string;
  label: string;
  amount: number;
  method?: string;
  date?: string;
  status: "new" | "paid";
  /** soft-deleted; shown only via "Show deleted payments" */
  deleted?: boolean;
}

export interface DiscussionMessage {
  id: string;
  channel: "guest" | "staff";
  subject: string;
  body: string;
  author: string;
  at: string;
  /** saved but not sent */
  draft?: boolean;
  /** whether the recipient opened it (guest messages) */
  viewed?: boolean;
  /** document names shared with this message */
  sharedDocs?: string[];
}

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
  dueDate?: string;
}

export interface NoteItem {
  id: string;
  body: string;
  author: string;
  at: string;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  at: string;
}

export type DocStatus = "not_signed" | "signed" | "n/a";

export type DocName =
  | "Banquet Event Order"
  | "Contract"
  | "Invoice"
  | "Kitchen Sheet"
  | "Menu"
  | "Proposal";

/** Who each generated PDF is written for */
export type DocAudience = "Kitchen" | "Staff" | "Manager" | "Client" | "Billing";

export interface EventDocument {
  id: string;
  name: DocName;
  format: "PDF";
  status: DocStatus;
  /** target reader — decides what data is extracted into the PDF */
  audience?: DocAudience;
  /** whether GHL share / email is available */
  shareable: boolean;
  linkable: boolean;
}

export interface Contract {
  id: string;
  /** numeric-looking id shown on the docs page, e.g. 39805176 */
  orderNumber: string;
  eventId: string;
  /** GHL contact this contract was created from */
  contactId: string;
  contactSnapshot: GHLContact;
  additionalContactIds: string[];

  /* -- Event details -- */
  eventName: string;
  bookingName: string;
  date: string; // ISO date
  startTime: string; // "18:00"
  endTime: string; // "21:00"
  setupTime?: string;
  teardownTime?: string;
  status: EventStatus;
  eventStyle: string;
  eventType?: string;
  areaIds: string[];
  expectedGuests: number;
  guaranteedGuests?: number;
  mealPeriods?: string;
  ownerId: string;
  managerIds?: string[];
  leadSources?: string[];
  referredBy?: string;
  ticketedEvent: boolean;

  /* -- Body -- */
  specialInstructions: string;
  kitchenNotes?: string;
  setupNotes?: string;
  additionalInformation?: string;
  billingNotes: string;
  termsAndConditions: string;
  lineItems: ContractLineItem[];
  billing: BillingSettings;

  /* -- Docs -- */
  documents: EventDocument[];

  /* -- Activity -- */
  statusHistory?: StatusChange[];
  payments?: PaymentRecord[];
  messages?: DiscussionMessage[];
  tasks?: TaskItem[];
  notes?: NoteItem[];
  attachments?: AttachedFile[];
  /** hide financials from the guest-facing portal */
  portalHidden?: boolean;

  createdAt: string;
  updatedAt: string;
}

/* ---------------- Restaurant settings ---------------- */

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | null; // null → header/choice rows like "STARTERS (Choice of one)"
  category: LineItemCategory;
  applicableCharges: ApplicableCharge[];
  /** header rows ("STARTERS", "OR") are not selectable */
  isHeader?: boolean;
}

export interface MenuGroup {
  id: string;
  name: string; // e.g. "Prefixe Menu $108"
  /** which contract section items land in by default */
  defaultSection: LineItemSection;
  items: MenuItem[];
}

export interface VenueArea {
  id: string;
  name: string;
  capacity: number;
  parentId?: string | null;
}

export interface RestaurantSettings {
  venueName: string;
  menus: MenuGroup[];
  areas: VenueArea[];
  eventStyles: string[];
  eventTypes: string[];
  owners: { id: string; name: string; email?: string }[];
  taxes: {
    salesTaxRate: number;
    gratuityRate: number;
    adminFeeRate: number;
  };
  defaultDepositPercent: number;
  defaultTerms: string;
}

/* ---------------- Theme ---------------- */

export interface ThemeSettings {
  /** oklch or hex color strings */
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  cardColor: string;
  /** font family stacks */
  bodyFont: string;
  headingFont: string;
  /** px sizes */
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
  paragraphSize: number;
  smallSize: number;
  /** border radius in rem */
  radius: number;
  /** heading font weight */
  headingWeight: number;
}

export const DEFAULT_THEME: ThemeSettings = {
  primaryColor: "#1f6f5c",
  accentColor: "#2f8f77",
  backgroundColor: "#f6faf8",
  foregroundColor: "#12241f",
  cardColor: "#ffffff",
  bodyFont: "Geist, ui-sans-serif, system-ui, sans-serif",
  headingFont: "Geist, ui-sans-serif, system-ui, sans-serif",
  h1Size: 30,
  h2Size: 24,
  h3Size: 20,
  h4Size: 16,
  paragraphSize: 14,
  smallSize: 12,
  radius: 0.5,
  headingWeight: 700,
};
