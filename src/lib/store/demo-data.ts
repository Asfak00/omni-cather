import { addDays, format, subDays } from "date-fns";
import type { Contract, GHLContact, RestaurantSettings } from "@/types";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import { buildDefaultDocuments } from "@/lib/contract-factory";

/* ============================================================
 * Demo data — production-shaped events covering the whole flow:
 * today's event, one in the next 7 days, one further out, a
 * closed past event and a fresh undated lead. Dates are built
 * relative to "now" at seed time so every list group has rows.
 * All documents/PDFs are generated in real time from this data.
 * ============================================================ */

const day = (offset: number) =>
  format(offset >= 0 ? addDays(new Date(), offset) : subDays(new Date(), -offset), "yyyy-MM-dd");

const iso = (daysAgo: number, hour = 10, minute = 0) => {
  const d = subDays(new Date(), daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

function contact(id: string): GHLContact {
  const c = MOCK_CONTACTS.find((m) => m.id === id);
  if (!c) throw new Error(`Unknown mock contact: ${id}`);
  return c;
}

export function buildDemoContracts(settings: RestaurantSettings): Contract[] {
  const { salesTaxRate, gratuityRate, adminFeeRate } = settings.taxes;

  const baseBilling = {
    salesTaxRate,
    gratuityRate,
    adminFeeRate,
    roomRental: 0,
    fbMinimum: 0,
    depositPercent: settings.defaultDepositPercent,
    depositMode: "percent" as const,
    depositPaid: false,
    transferFinancialsToEvent: true,
  };
  const allCharges: ("Admin Fee" | "Gratuity" | "Sales Tax")[] = [
    "Admin Fee",
    "Gratuity",
    "Sales Tax",
  ];

  /* ---------- 1. Today: Birthday — WebMakers LTD ---------- */
  const birthday: Contract = {
    id: "demo-birthday",
    orderNumber: "39975042",
    eventId: "61532314",
    contactId: "mock-anup",
    contactSnapshot: contact("mock-anup"),
    additionalContactIds: [],

    eventName: "Birthday",
    bookingName: "Birthday",
    date: day(0),
    startTime: "12:00",
    endTime: "13:00",
    status: "PROSPECT",
    eventStyle: "On-Premise Event",
    eventType: "Birthday Party",
    areaIds: ["area-vip"],
    expectedGuests: 19,
    guaranteedGuests: 15,
    mealPeriods: "Lunch",
    ownerId: "owner-barry",
    managerIds: ["owner-kirby"],
    leadSources: ["GHL Web Lead"],
    referredBy: "Facebook",
    ticketedEvent: false,

    specialInstructions: "Birthday cake at 12:45 — candles ready at the pass.",
    kitchenNotes: "Hey, we need a gluten-free diet for 3 guests.",
    setupNotes: "VIP Room: one long table for 19, balloon arch at entrance.",
    additionalInformation: "Hey, we need a gluten-free diet..",
    billingNotes: "",
    termsAndConditions: settings.defaultTerms,
    lineItems: [
      {
        id: "bd-food-1",
        section: "food",
        qty: 5,
        description: "Pork & Vegetables Dumplings",
        price: 100,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
      },
      {
        id: "bd-food-2",
        section: "food",
        qty: 5,
        description: "Crispy Shredded Beef",
        price: 125,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
      },
      {
        id: "bd-food-3",
        section: "food",
        qty: 5,
        description: "Burgers",
        price: 100,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
      },
      {
        id: "bd-bev-1",
        section: "beverage",
        qty: 100,
        description: "2 HOURS OPEN BAR PACKAGES",
        altDescription: "Premium spirits, wine & beer per guest",
        price: 60,
        category: "Beverage",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "bar-2hr",
      },
      {
        id: "bd-bev-2",
        section: "beverage",
        qty: 10,
        description: "Champagne",
        price: 1000,
        category: "Beverage",
        applicableCharges: allCharges,
        discount: null,
      },
      {
        id: "bd-other-1",
        section: "other",
        qty: 1,
        description: "Photographer",
        price: 150,
        category: "Misc",
        applicableCharges: [],
        discount: null,
      },
    ],
    billing: {
      ...baseBilling,
      depositPercent: 12,
      depositMode: "amount",
      depositDueDate: day(0),
      balanceDueDate: day(1),
    },
    documents: buildDefaultDocuments(),
    statusHistory: [{ to: "PROSPECT", at: iso(1, 10, 34), by: "Barry Huang" }],
    payments: [],
    messages: [
      {
        id: "bd-msg-1",
        channel: "guest",
        subject: `Contract for Birthday on ${format(new Date(), "MMMM d, yyyy")} at ${settings.venueName}`,
        body: `Hello Anup, We are thrilled to be hosting your event on ${format(new Date(), "EEEE, MMMM d")}. Please review the attached contract and let us know if you have any questions.`,
        author: "Barry Huang",
        at: iso(1, 14, 22),
      },
    ],
    tasks: [
      { id: "bd-task-1", title: "Collect signed contract", done: false, dueDate: day(0) },
      { id: "bd-task-2", title: "Confirm gluten-free menu with kitchen", done: true },
    ],
    notes: [
      {
        id: "bd-note-1",
        body: "Client called — wants the cake brought out with sparklers.",
        author: "Barry Huang",
        at: iso(1, 16, 5),
      },
    ],
    createdAt: iso(1, 10, 34),
    updatedAt: iso(0, 9, 12),
  };

  /* ---------- 2. Next 7 days: Corporate Dinner — Chen & Partners ---------- */
  const corporate: Contract = {
    id: "demo-corporate",
    orderNumber: "40118276",
    eventId: "61540098",
    contactId: "mock-amelia",
    contactSnapshot: contact("mock-amelia"),
    additionalContactIds: [],

    eventName: "Chen & Partners Corporate Dinner",
    bookingName: "Chen & Partners Corporate Dinner",
    date: day(4),
    startTime: "19:00",
    endTime: "22:00",
    setupTime: "17:00",
    teardownTime: "23:00",
    status: "DEFINITE",
    eventStyle: "On-Premise Event",
    eventType: "Corporate Event",
    areaIds: ["area-main"],
    expectedGuests: 45,
    guaranteedGuests: 42,
    mealPeriods: "Dinner",
    ownerId: "owner-barry",
    managerIds: [],
    leadSources: ["Referral"],
    referredBy: "Existing client",
    ticketedEvent: false,

    specialInstructions: "Projector + podium for a 15-minute presentation at 8pm.",
    kitchenNotes: "2 vegan plates, 1 shellfish allergy (seat 12).",
    setupNotes: "Main Floor: 5 rounds of 9, stage left podium, uplights in brand blue.",
    additionalInformation: "Annual partner dinner — white glove service requested.",
    billingNotes: "PO #CP-2291 must appear on the final invoice.",
    termsAndConditions: settings.defaultTerms,
    lineItems: [
      {
        id: "cp-food-1",
        section: "food",
        qty: 45,
        description: "PREFIXE MENU",
        altDescription: "Choice of starter + appetizer",
        price: 108,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "pf108-main",
      },
      {
        id: "cp-food-2",
        section: "food",
        qty: 4,
        description: "Artisan Cheese & Charcuterie",
        altDescription: "Serves 10-12 guests",
        price: 145,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "platter-2",
      },
      {
        id: "cp-bev-1",
        section: "beverage",
        qty: 45,
        description: "3 Hours Open Bar",
        altDescription: "Premium spirits, wine & beer per guest",
        price: 80,
        category: "Beverage",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "bar-3hr",
      },
      {
        id: "cp-other-1",
        section: "other",
        qty: 3,
        description: "AV Technician (per hour)",
        price: 85,
        category: "Audio/Visual",
        applicableCharges: ["Sales Tax"],
        discount: null,
      },
    ],
    billing: {
      ...baseBilling,
      fbMinimum: 5000,
      depositPercent: 50,
      depositPaid: true,
      depositDueDate: day(-10),
      balanceDueDate: day(4),
      customCharges: [
        { id: "cp-fee-1", label: "Cleaning Fee", mode: "amount", value: 150 },
      ],
    },
    documents: buildDefaultDocuments().map((d) =>
      d.name === "Contract" ? { ...d, status: "signed" as const } : d
    ),
    statusHistory: [
      { to: "PROSPECT", at: iso(21, 9, 15), by: "Barry Huang" },
      { from: "PROSPECT", to: "TENTATIVE", at: iso(18, 11, 40), by: "Barry Huang" },
      { from: "TENTATIVE", to: "DEFINITE", at: iso(12, 15, 5), by: "Barry Huang" },
    ],
    payments: [
      {
        id: "cp-pay-1",
        label: "Payment",
        amount: 1500,
        method: "Credit Card",
        date: day(-8),
        status: "paid",
      },
    ],
    messages: [
      {
        id: "cp-msg-1",
        channel: "guest",
        subject: "Deposit received — you're confirmed!",
        body: "Hi Amelia, your deposit has been received and your date is confirmed. We look forward to hosting Chen & Partners.",
        author: "Barry Huang",
        at: iso(10, 9, 30),
      },
      {
        id: "cp-msg-2",
        channel: "staff",
        subject: "AV setup",
        body: "Team — projector and podium go stage left, sound check at 5:30pm.",
        author: "Kirby Repolido",
        at: iso(3, 17, 45),
      },
    ],
    tasks: [
      { id: "cp-task-1", title: "Final guest count guarantee", done: true, dueDate: day(-1) },
      { id: "cp-task-2", title: "Print place cards", done: false, dueDate: day(3) },
      { id: "cp-task-3", title: "Confirm AV tech arrival 4:30pm", done: false, dueDate: day(4) },
    ],
    notes: [
      {
        id: "cp-note-1",
        body: "CFO is gluten-free — kitchen already flagged, seat 3.",
        author: "Barry Huang",
        at: iso(9, 12, 0),
      },
    ],
    createdAt: iso(21, 9, 15),
    updatedAt: iso(2, 10, 20),
  };

  /* ---------- 3. Beyond 7 days: Testing Corp Event — Kirby Studios ---------- */
  const testingCorp: Contract = {
    id: "demo-testing-corp",
    orderNumber: "39805176",
    eventId: "61291877",
    contactId: "mock-kirby",
    contactSnapshot: contact("mock-kirby"),
    additionalContactIds: [],

    eventName: "Testing Corp Event",
    bookingName: "Testing Corp Event",
    date: day(64),
    startTime: "18:00",
    endTime: "21:00",
    status: "PROSPECT",
    eventStyle: "On-Premise Event",
    eventType: "Rehearsal Dinner",
    areaIds: ["area-lounge"],
    expectedGuests: 100,
    mealPeriods: "",
    ownerId: "owner-barry",
    managerIds: [],
    leadSources: ["Reservation Form", "GHL Web Lead"],
    referredBy: "",
    ticketedEvent: false,

    specialInstructions: "",
    kitchenNotes: "",
    setupNotes: "",
    additionalInformation: "Testing",
    billingNotes: "",
    termsAndConditions: settings.defaultTerms,
    lineItems: [
      {
        id: "tc-food-1",
        section: "food",
        qty: 10,
        description: "PREFIXE MENU",
        altDescription: "Choice of starter + appetizer",
        price: 108,
        category: "Food",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "pf108-main",
      },
      {
        id: "tc-bev-1",
        section: "beverage",
        qty: 100,
        description: "2 Hours Open Bar",
        altDescription: "Premium spirits, wine & beer per guest",
        price: 60,
        category: "Beverage",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "bar-2hr",
      },
    ],
    billing: {
      ...baseBilling,
      depositPercent: 50,
      balanceDueDate: day(64),
    },
    documents: buildDefaultDocuments(),
    statusHistory: [
      { to: "PROSPECT", at: iso(9, 9, 57), by: "Barry Huang" },
      { from: "PROSPECT", to: "DEFINITE", at: iso(9, 10, 7), by: "Barry Huang" },
      { from: "DEFINITE", to: "PROSPECT", at: iso(9, 10, 11), by: "Barry Huang" },
    ],
    payments: [],
    messages: [
      {
        id: "tc-msg-1",
        channel: "guest",
        subject: `Contract for Testing Corp Event at ${settings.venueName}`,
        body: "Hello Kirby, We are thrilled to be hosting your event. One bill for all charges will be given to Account unless prior arrangements are made.",
        author: "Barry Huang",
        at: iso(8, 14, 22),
      },
    ],
    tasks: [
      { id: "tc-task-1", title: "Follow up on unsigned contract", done: false, dueDate: day(7) },
    ],
    notes: [],
    createdAt: iso(9, 9, 57),
    updatedAt: iso(1, 14, 29),
  };

  /* ---------- 4. Past: Wedding Reception — closed & fully paid ---------- */
  const wedding: Contract = {
    id: "demo-wedding",
    orderNumber: "39610255",
    eventId: "61100432",
    contactId: "mock-marcus",
    contactSnapshot: contact("mock-marcus"),
    additionalContactIds: [],

    eventName: "Rivera Wedding Reception",
    bookingName: "Rivera Wedding Reception",
    date: day(-21),
    startTime: "17:00",
    endTime: "23:00",
    setupTime: "14:00",
    status: "CLOSED",
    eventStyle: "On-Premise Event",
    eventType: "Wedding Reception",
    areaIds: ["area-main", "area-lounge"],
    expectedGuests: 120,
    guaranteedGuests: 118,
    mealPeriods: "Dinner",
    ownerId: "owner-kirby",
    managerIds: ["owner-barry"],
    leadSources: ["Referral"],
    referredBy: "Rivera Weddings",
    ticketedEvent: false,

    specialInstructions: "First dance at 7:30pm, toasts at 8pm.",
    kitchenNotes: "Kids menu ×6. Cake service after toasts.",
    setupNotes: "Both rooms combined, dance floor center, sweetheart table.",
    additionalInformation: "",
    billingNotes: "",
    termsAndConditions: settings.defaultTerms,
    lineItems: [
      {
        id: "wd-food-1",
        section: "food",
        qty: 120,
        description: "PREFIXE MENU",
        price: 108,
        category: "Food",
        applicableCharges: allCharges,
        discount: { type: "percent", value: 10 },
      },
      {
        id: "wd-bev-1",
        section: "beverage",
        qty: 120,
        description: "3 Hours Open Bar",
        price: 80,
        category: "Beverage",
        applicableCharges: allCharges,
        discount: null,
        menuItemId: "bar-3hr",
      },
      {
        id: "wd-other-1",
        section: "other",
        qty: 6,
        description: "Event Staff (per hour)",
        price: 45,
        category: "Labor",
        applicableCharges: ["Sales Tax"],
        discount: null,
      },
    ],
    billing: {
      ...baseBilling,
      roomRental: 1500,
      fbMinimum: 15000,
      depositPercent: 50,
      depositPaid: true,
      depositDueDate: day(-60),
      balanceDueDate: day(-21),
    },
    documents: buildDefaultDocuments().map((d) =>
      d.status === "not_signed" ? { ...d, status: "signed" as const } : d
    ),
    statusHistory: [
      { to: "PROSPECT", at: iso(95, 10, 0), by: "Kirby Repolido" },
      { from: "PROSPECT", to: "DEFINITE", at: iso(80, 13, 30), by: "Kirby Repolido" },
      { from: "DEFINITE", to: "CLOSED", at: iso(20, 11, 0), by: "Kirby Repolido" },
    ],
    payments: [
      {
        id: "wd-pay-1",
        label: "Payment",
        amount: 15000,
        method: "Bank Transfer",
        date: day(-25),
        status: "paid",
      },
      {
        id: "wd-pay-2",
        label: "Payment",
        amount: 4443.66,
        method: "Credit Card",
        date: day(-20),
        status: "paid",
      },
    ],
    messages: [
      {
        id: "wd-msg-1",
        channel: "guest",
        subject: "Thank you!",
        body: "Marcus, it was a pleasure hosting your reception. Final invoice attached — thank you for celebrating with us!",
        author: "Kirby Repolido",
        at: iso(19, 10, 15),
      },
    ],
    tasks: [{ id: "wd-task-1", title: "Send thank-you note", done: true }],
    notes: [],
    createdAt: iso(95, 10, 0),
    updatedAt: iso(19, 10, 16),
  };

  /* ---------- 5. Fresh undated lead — just arrived from the form ---------- */
  const lead: Contract = {
    id: "demo-lead",
    orderNumber: "40230011",
    eventId: "61610877",
    contactId: "mock-sofia",
    contactSnapshot: contact("mock-sofia"),
    additionalContactIds: [],

    eventName: "Nakamura Events Private Dining",
    bookingName: "Nakamura Events Private Dining",
    date: "",
    startTime: "18:00",
    endTime: "21:00",
    status: "PROSPECT",
    eventStyle: "On-Premise Event",
    eventType: "Private Dining",
    areaIds: [],
    expectedGuests: 0,
    ownerId: "owner-barry",
    ticketedEvent: false,

    specialInstructions: "",
    billingNotes: "",
    termsAndConditions: settings.defaultTerms,
    lineItems: [],
    billing: { ...baseBilling },
    documents: buildDefaultDocuments(),
    statusHistory: [{ to: "PROSPECT", at: iso(0, 8, 45), by: "Barry Huang" }],
    payments: [],
    messages: [],
    tasks: [{ id: "ld-task-1", title: "Call to qualify the lead", done: false, dueDate: day(1) }],
    notes: [],
    createdAt: iso(0, 8, 45),
    updatedAt: iso(0, 8, 45),
  };

  return [birthday, corporate, testingCorp, wedding, lead];
}
