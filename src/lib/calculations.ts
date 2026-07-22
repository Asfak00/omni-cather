import type {
  ApplicableCharge,
  BillingSettings,
  Contract,
  ContractLineItem,
  ContractTotals,
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

export function computeTotals(
  lineItems: ContractLineItem[],
  billing: BillingSettings
): ContractTotals {
  const foodTotal = sectionTotal(lineItems, "food");
  const beverageTotal = sectionTotal(lineItems, "beverage");
  const otherTotal = sectionTotal(lineItems, "other");
  const subtotal = round2(foodTotal + beverageTotal + otherTotal);

  const salesTax = round2(
    (chargeableBase(lineItems, "Sales Tax") * billing.salesTaxRate) / 100
  );
  const gratuity = round2(
    (chargeableBase(lineItems, "Gratuity") * billing.gratuityRate) / 100
  );
  const adminFee = round2(
    (chargeableBase(lineItems, "Admin Fee") * billing.adminFeeRate) / 100
  );

  const grandTotal = round2(
    subtotal + salesTax + gratuity + adminFee + (billing.roomRental || 0)
  );
  const deposit = round2((grandTotal * (billing.depositPercent || 0)) / 100);
  const estimatedAmountDue = round2(
    billing.depositPaid ? grandTotal - deposit : grandTotal
  );

  return {
    foodTotal,
    beverageTotal,
    otherTotal,
    subtotal,
    salesTax,
    gratuity,
    adminFee,
    roomRental: round2(billing.roomRental || 0),
    fbMinimumMet: subtotal >= (billing.fbMinimum || 0),
    grandTotal,
    deposit,
    estimatedAmountDue,
  };
}

export function contractTotals(contract: Contract): ContractTotals {
  return computeTotals(contract.lineItems, contract.billing);
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
