import type {
  ApplicableCharge,
  BillingSettings,
  Contract,
  ContractLineItem,
  ContractTotals,
  PaymentRecord,
} from "@/types";

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Line total after discount */
export function lineItemTotal(item: ContractLineItem): number {
  const base = (item.qty || 0) * (item.price || 0);
  if (!item.discount || !item.discount.value) return round2(base);
  if (item.discount.type === "percent") {
    return round2(base * (1 - item.discount.value / 100));
  }
  return round2(Math.max(0, base - item.discount.value));
}

function sectionTotal(items: ContractLineItem[], section: string): number {
  return round2(
    items
      .filter((i) => i.section === section)
      .reduce((sum, i) => sum + lineItemTotal(i), 0)
  );
}

/** Sum of line totals that have a given charge applied */
function chargeableBase(
  items: ContractLineItem[],
  charge: ApplicableCharge
): number {
  return items
    .filter((i) => i.applicableCharges.includes(charge))
    .reduce((sum, i) => sum + lineItemTotal(i), 0);
}

/** Billing-widget breakdown rows grouped by line-item category */
function categoryTotals(items: ContractLineItem[]) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.category || "Uncategorized";
    map.set(key, (map.get(key) ?? 0) + lineItemTotal(item));
  }
  return Array.from(map.entries()).map(([category, total]) => ({
    category,
    total: round2(total),
  }));
}

export function computeTotals(
  lineItems: ContractLineItem[],
  billing: BillingSettings,
  opts: { expectedGuests?: number; payments?: PaymentRecord[] } = {}
): ContractTotals {
  const foodTotal = sectionTotal(lineItems, "food");
  const beverageTotal = sectionTotal(lineItems, "beverage");
  const otherTotal = sectionTotal(lineItems, "other");
  const subtotal = round2(foodTotal + beverageTotal + otherTotal);

  const rates: Record<ApplicableCharge, number> = {
    "Sales Tax": billing.salesTaxRate,
    Gratuity: billing.gratuityRate,
    "Admin Fee": billing.adminFeeRate,
  };

  // First pass: each charge computed from its own item base
  const baseAmounts: Record<ApplicableCharge, number> = {
    "Sales Tax": round2((chargeableBase(lineItems, "Sales Tax") * rates["Sales Tax"]) / 100),
    Gratuity: round2((chargeableBase(lineItems, "Gratuity") * rates.Gratuity) / 100),
    "Admin Fee": round2((chargeableBase(lineItems, "Admin Fee") * rates["Admin Fee"]) / 100),
  };

  // Second pass: apply "include totals from" compounding — e.g. Sales Tax
  // configured to also tax the Gratuity and/or Admin Fee amounts.
  const finalAmounts = { ...baseAmounts };
  for (const charge of Object.keys(baseAmounts) as ApplicableCharge[]) {
    const settings = billing.chargeSettings?.[charge];
    if (settings?.includeFrom?.length) {
      const extraBase = settings.includeFrom.reduce(
        (sum, other) => sum + (other !== charge ? baseAmounts[other] : 0),
        0
      );
      finalAmounts[charge] = round2(
        baseAmounts[charge] + (extraBase * rates[charge]) / 100
      );
    }
  }

  const inTotal = (charge: ApplicableCharge) =>
    billing.chargeSettings?.[charge]?.excludeFromTotals ? 0 : finalAmounts[charge];

  const customChargeTotals = (billing.customCharges ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    total: round2(c.mode === "percent" ? (subtotal * c.value) / 100 : c.value),
  }));
  const customTotal = customChargeTotals.reduce((s, c) => s + c.total, 0);

  const grandTotal = round2(
    subtotal +
      inTotal("Sales Tax") +
      inTotal("Gratuity") +
      inTotal("Admin Fee") +
      customTotal +
      (billing.roomRental || 0)
  );

  const deposit = round2(
    (billing.depositMode ?? "percent") === "amount"
      ? billing.depositPercent || 0
      : (grandTotal * (billing.depositPercent || 0)) / 100
  );

  const paid = round2(
    (opts.payments ?? [])
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + p.amount, 0) + (billing.depositPaid ? deposit : 0)
  );
  const remaining = round2(Math.max(0, grandTotal - paid));

  const pricePerPerson = opts.expectedGuests
    ? round2(subtotal / opts.expectedGuests)
    : 0;

  return {
    foodTotal,
    beverageTotal,
    otherTotal,
    categoryTotals: categoryTotals(lineItems),
    subtotal,
    salesTax: finalAmounts["Sales Tax"],
    gratuity: finalAmounts.Gratuity,
    adminFee: finalAmounts["Admin Fee"],
    customChargeTotals,
    roomRental: round2(billing.roomRental || 0),
    fbMinimumMet: subtotal >= (billing.fbMinimum || 0),
    grandTotal,
    deposit,
    paid,
    remaining,
    pricePerPerson,
    estimatedAmountDue: remaining,
  };
}

export function contractTotals(contract: Contract): ContractTotals {
  return computeTotals(contract.lineItems, contract.billing, {
    expectedGuests: contract.expectedGuests,
    payments: contract.payments,
  });
}

export const currency = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

/** "18:00" → "6:00 pm" */
export function formatTime(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? "pm" : "am";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}
