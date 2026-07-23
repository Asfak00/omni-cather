import type { RestaurantSettings } from "@/types";

export const DEFAULT_TERMS = `CONTRACT CONDITIONS: All event agreements are made upon and subject to the rules and regulations of the Restaurant and the following conditions:

CONFIRMATION OF RESERVATION: All group bookings require a signed contract and completed credit card authorization form. Otherwise, group space is subject to release without further notice.

PAYMENT: Final payment is due at the conclusion of the event. Restaurant accepts cash, pre-approved company check, MasterCard, Visa, Discover Card, Diners Club, JCB, and American Express. One bill for all charges will be given to Account (the "Client") unless prior arrangements are made with Restaurant's sales department.

GUEST COUNT GUARANTEES: Final guest count must be guaranteed five (5) business days before the event. Saturday, Sunday, and Monday event guarantees are due by the preceding Thursday at 4:00 PM.`;

export const DEFAULT_CATEGORIES: RestaurantSettings["categories"] = [
  {
    id: "cat-av",
    name: "Audio/Visual",
    internalName: "Audio/Visual",
    defaultCharges: ["Sales Tax"],
  },
  {
    id: "cat-beverage",
    name: "Beverage",
    internalName: "Beverage",
    defaultCharges: ["Admin Fee", "Gratuity", "Sales Tax"],
  },
  {
    id: "cat-food",
    name: "Food",
    internalName: "Food",
    defaultCharges: ["Admin Fee", "Gratuity", "Sales Tax"],
  },
  {
    id: "cat-labor",
    name: "Labor",
    internalName: "Labor",
    defaultCharges: ["Sales Tax"],
  },
  { id: "cat-misc", name: "Misc", internalName: "Misc", defaultCharges: [] },
];

export const DEFAULT_BILLING_DETAILS: RestaurantSettings["billingDetails"] = [
  {
    id: "bd-admin-fee",
    builtin: "Admin Fee",
    description: "Admin Fee",
    internalName: "Admin Fee",
    defaultValue: "5%",
    inclusive: false,
    locations: ["Upon the Palace"],
    associated: [],
  },
  {
    id: "bd-gratuity",
    builtin: "Gratuity",
    description: "Gratuity",
    internalName: "Gratuity",
    defaultValue: "20%",
    inclusive: false,
    locations: ["Upon the Palace"],
    associated: [],
  },
  {
    id: "bd-sales-tax",
    builtin: "Sales Tax",
    description: "Sales Tax",
    internalName: "Sales Tax",
    defaultValue: "8.875%",
    inclusive: false,
    locations: ["Upon the Palace"],
    associated: [],
  },
];

export const DEFAULT_DOC_LAYOUTS: RestaurantSettings["docLayouts"] = [
  { name: "Banquet Event Order", enabled: true },
  { name: "Contract", enabled: true },
  { name: "Invoice", enabled: true },
  { name: "Kitchen Sheet", enabled: true, internal: true },
  { name: "Menu", enabled: true },
  { name: "Proposal", enabled: true },
];

export const DEFAULT_RESTAURANT_SETTINGS: RestaurantSettings = {
  venueName: "Upon the Palace",
  categories: DEFAULT_CATEGORIES,
  billingDetails: DEFAULT_BILLING_DETAILS,
  docLayouts: DEFAULT_DOC_LAYOUTS,
  docQrEnabled: false,
  menus: [
    {
      id: "menu-sample-apps",
      name: "SAMPLE Menu - Appetizers",
      defaultSection: "food",
      items: [
        {
          id: "app-1",
          name: "Crispy Calamari",
          description: "Lightly fried, served with chili aioli",
          price: 18,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
        {
          id: "app-2",
          name: "Tuna Tartare",
          description: "Ahi tuna, avocado, sesame, wonton crisps",
          price: 22,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
      ],
    },
    {
      id: "menu-platters",
      name: "Platters Menu",
      defaultSection: "food",
      items: [
        {
          id: "platter-1",
          name: "Seasonal Crudité Platter",
          description: "Serves 10-12 guests",
          price: 95,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
        {
          id: "platter-2",
          name: "Artisan Cheese & Charcuterie",
          description: "Serves 10-12 guests",
          price: 145,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
      ],
    },
    {
      id: "menu-prefixe-108",
      name: "Prefixe Menu $108",
      defaultSection: "food",
      items: [
        {
          id: "pf108-main",
          name: "PREFIXE MENU",
          price: 108,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
        {
          id: "pf108-starters-header",
          name: "STARTERS",
          description: "(Choice of one)",
          price: null,
          category: "Food",
          applicableCharges: [],
          isHeader: true,
        },
        {
          id: "pf108-soup",
          name: "Beef West Lake Soup (GF)",
          description: "Minced beef & egg drop soup",
          price: null,
          category: "Food",
          applicableCharges: [],
        },
        {
          id: "pf108-or-1",
          name: "OR",
          price: null,
          category: "Food",
          applicableCharges: [],
          isHeader: true,
        },
        {
          id: "pf108-salad",
          name: "Palace Cucumber Salad",
          description:
            "Cucumber dressed with garlic, sesame oil, rice vinegar, and a delicate chili finish",
          price: null,
          category: "Food",
          applicableCharges: [],
        },
        {
          id: "pf108-apps-header",
          name: "APPETIZERS",
          description: "(Choice of one)",
          price: null,
          category: "Food",
          applicableCharges: [],
          isHeader: true,
        },
        {
          id: "pf108-shrimp",
          name: "Rock Shrimp",
          description: "Crispy rock shrimp with house sauce",
          price: null,
          category: "Food",
          applicableCharges: [],
        },
      ],
    },
    {
      id: "menu-prefixe-88",
      name: "Prefixe Menu $88",
      defaultSection: "food",
      items: [
        {
          id: "pf88-main",
          name: "PREFIXE MENU",
          price: 88,
          category: "Food",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
      ],
    },
    {
      id: "menu-open-bar",
      name: "Open Bar Packages",
      defaultSection: "beverage",
      items: [
        {
          id: "bar-2hr",
          name: "2 Hours Open Bar",
          description: "Premium spirits, wine & beer per guest",
          price: 60,
          category: "Beverage",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
        {
          id: "bar-3hr",
          name: "3 Hours Open Bar",
          description: "Premium spirits, wine & beer per guest",
          price: 80,
          category: "Beverage",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
      ],
    },
    {
      id: "menu-drinks",
      name: "Drink Menu",
      defaultSection: "beverage",
      items: [
        {
          id: "drink-1",
          name: "Signature Cocktail",
          price: 18,
          category: "Beverage",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
        {
          id: "drink-2",
          name: "House Wine (bottle)",
          price: 55,
          category: "Beverage",
          applicableCharges: ["Sales Tax", "Gratuity", "Admin Fee"],
        },
      ],
    },
  ],
  areas: [
    { id: "area-main", name: "Main Floor", capacity: 100, parentId: null },
    { id: "area-vip", name: "VIP Room", capacity: 20, parentId: "area-main" },
    { id: "area-lounge", name: "Lounge", capacity: 120, parentId: null },
  ],
  eventStyles: ["On-Premise Event", "Off-Premise Event", "Delivery", "Other"],
  eventTypes: [
    "Rehearsal Dinner",
    "Corporate Event",
    "Birthday Party",
    "Wedding Reception",
    "Private Dining",
    "Other",
  ],
  owners: [
    { id: "owner-barry", name: "Barry Huang", email: "barry.h@uponthepalace.com" },
    { id: "owner-kirby", name: "Kirby Repolido", email: "kirby@uponthepalace.com" },
  ],
  taxes: {
    salesTaxRate: 8.875,
    gratuityRate: 20,
    adminFeeRate: 5,
  },
  defaultDepositPercent: 50,
  defaultTerms: DEFAULT_TERMS,
};
