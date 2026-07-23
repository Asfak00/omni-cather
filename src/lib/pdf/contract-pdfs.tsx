/* ============================================================
 * PDF generation (server-only)
 *
 * Every document extracts a different slice of the contract for
 * its audience:
 *   Kitchen Sheet       → kitchen team   (food prep, no prices)
 *   Banquet Event Order → staff / ops    (full run sheet)
 *   Contract            → manager+client (terms & signatures)
 *   Invoice             → client billing (itemized charges)
 *   Menu                → client         (dishes & descriptions)
 *   Proposal            → client         (offer summary)
 * ============================================================ */
import React from "react";
import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Contract, ContractLineItem, RestaurantSettings } from "@/types";
import { computeTotals, currency, formatTime, lineItemTotal } from "@/lib/calculations";

/* ---------------- styles ---------------- */

const BRAND = "#1f6f5c";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    padding: 40,
    lineHeight: 1.45,
  },
  headerBar: {
    borderBottomWidth: 2,
    borderBottomColor: BRAND,
    paddingBottom: 10,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  venue: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BRAND },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  audience: { fontSize: 8, color: "#666" },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: BRAND,
    marginTop: 14,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { width: 120, fontFamily: "Helvetica-Bold" },
  value: { flex: 1 },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 3,
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingVertical: 4,
  },
  colQty: { width: 40 },
  colDesc: { flex: 1 },
  colPrice: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  note: { fontSize: 8.5, color: "#555" },
  totalsBox: { marginTop: 10, alignSelf: "flex-end", width: 240 },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  grand: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 3,
    paddingTop: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  terms: { fontSize: 8, color: "#333", marginTop: 4 },
  signBlock: {
    marginTop: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signLine: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 4,
    fontSize: 8,
    color: "#555",
  },
  badge: {
    backgroundColor: BRAND,
    color: "#fff",
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    alignSelf: "flex-start",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 7.5,
    color: "#888",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
    paddingTop: 6,
  },
});

/* ---------------- shared pieces ---------------- */

interface Ctx {
  contract: Contract;
  settings: RestaurantSettings;
}

function fmtDate(date: string) {
  if (!date) return "TBD";
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function areaNames({ contract, settings }: Ctx) {
  return (
    contract.areaIds
      .map((id) => settings.areas.find((a) => a.id === id)?.name)
      .filter(Boolean)
      .join(", ") || "TBD"
  );
}

function owner({ contract, settings }: Ctx) {
  return settings.owners.find((o) => o.id === contract.ownerId);
}

function Header({ ctx, title, audience }: { ctx: Ctx; title: string; audience: string }) {
  return (
    <View style={s.headerBar} fixed>
      <View>
        <Text style={s.venue}>{ctx.settings.venueName}</Text>
        <Text style={s.audience}>Prepared for: {audience}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={s.docTitle}>{title}</Text>
        <Text style={s.audience}>
          Order #{ctx.contract.orderNumber} · Event #{ctx.contract.eventId}
        </Text>
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

function EventSummary({ ctx, showOwner = true }: { ctx: Ctx; showOwner?: boolean }) {
  const c = ctx.contract;
  const o = owner(ctx);
  return (
    <View>
      <Text style={s.sectionTitle}>Event Details</Text>
      <InfoRow label="Event" value={c.eventName} />
      <InfoRow label="Date" value={fmtDate(c.date)} />
      <InfoRow
        label="Time"
        value={`${formatTime(c.startTime)} – ${formatTime(c.endTime)}`}
      />
      {c.setupTime ? (
        <InfoRow label="Setup" value={formatTime(c.setupTime)} />
      ) : null}
      {c.teardownTime ? (
        <InfoRow label="Teardown" value={formatTime(c.teardownTime)} />
      ) : null}
      <InfoRow label="Area(s)" value={areaNames(ctx)} />
      <InfoRow label="Style" value={c.eventStyle} />
      {c.eventType ? <InfoRow label="Event Type" value={c.eventType} /> : null}
      <InfoRow label="Expected Guests" value={String(c.expectedGuests || "TBD")} />
      <InfoRow label="Status" value={c.status} />
      {showOwner && o ? (
        <InfoRow label="Sales Manager" value={`${o.name}${o.email ? ` · ${o.email}` : ""}`} />
      ) : null}
    </View>
  );
}

function ClientBlock({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract.contactSnapshot;
  return (
    <View>
      <Text style={s.sectionTitle}>Client</Text>
      {c.companyName ? <InfoRow label="Account" value={c.companyName} /> : null}
      <InfoRow label="Contact" value={c.name} />
      {c.email ? <InfoRow label="Email" value={c.email} /> : null}
      {c.phone ? <InfoRow label="Phone" value={c.phone} /> : null}
      {c.address ? (
        <InfoRow
          label="Address"
          value={[c.address, c.city, c.state].filter(Boolean).join(", ")}
        />
      ) : null}
    </View>
  );
}

function ItemsTable({
  items,
  title,
  showPrices,
  showNotes = true,
}: {
  items: ContractLineItem[];
  title: string;
  showPrices: boolean;
  showNotes?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <View wrap={false}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.tableHeader}>
        <Text style={s.colQty}>Qty</Text>
        <Text style={s.colDesc}>Item</Text>
        {showPrices ? <Text style={s.colPrice}>Price</Text> : null}
        {showPrices ? <Text style={s.colTotal}>Total</Text> : null}
      </View>
      {items.map((item) => (
        <View key={item.id} style={s.tableRow}>
          <Text style={s.colQty}>{item.qty || "—"}</Text>
          <View style={s.colDesc}>
            <Text>{item.description || "Untitled item"}</Text>
            {showNotes && item.altDescription ? (
              <Text style={s.note}>{item.altDescription}</Text>
            ) : null}
            {showPrices && item.discount?.value ? (
              <Text style={s.note}>
                Discount:{" "}
                {item.discount.type === "percent"
                  ? `${item.discount.value}%`
                  : currency(item.discount.value)}
              </Text>
            ) : null}
          </View>
          {showPrices ? (
            <Text style={s.colPrice}>{currency(item.price)}</Text>
          ) : null}
          {showPrices ? (
            <Text style={s.colTotal}>{currency(lineItemTotal(item))}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function TotalsBlock({ ctx }: { ctx: Ctx }) {
  const t = computeTotals(ctx.contract.lineItems, ctx.contract.billing);
  const b = ctx.contract.billing;
  return (
    <View style={s.totalsBox} wrap={false}>
      <View style={s.totalsRow}>
        <Text>Food</Text>
        <Text>{currency(t.foodTotal)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text>Beverage</Text>
        <Text>{currency(t.beverageTotal)}</Text>
      </View>
      {t.otherTotal > 0 ? (
        <View style={s.totalsRow}>
          <Text>Other Items</Text>
          <Text>{currency(t.otherTotal)}</Text>
        </View>
      ) : null}
      <View style={s.totalsRow}>
        <Text>Subtotal</Text>
        <Text>{currency(t.subtotal)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text>Sales Tax ({b.salesTaxRate}%)</Text>
        <Text>{currency(t.salesTax)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text>Gratuity ({b.gratuityRate}%)</Text>
        <Text>{currency(t.gratuity)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text>Admin Fee ({b.adminFeeRate}%)</Text>
        <Text>{currency(t.adminFee)}</Text>
      </View>
      {t.roomRental > 0 ? (
        <View style={s.totalsRow}>
          <Text>Room Rental</Text>
          <Text>{currency(t.roomRental)}</Text>
        </View>
      ) : null}
      <View style={[s.totalsRow, s.grand]}>
        <Text>Grand Total</Text>
        <Text>{currency(t.grandTotal)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text>
          Deposit ({b.depositPercent}%) — {b.depositPaid ? "PAID" : "NOT PAID"}
        </Text>
        <Text>{currency(t.deposit)}</Text>
      </View>
      <View style={s.totalsRow}>
        <Text style={{ fontFamily: "Helvetica-Bold" }}>Amount Due</Text>
        <Text style={{ fontFamily: "Helvetica-Bold" }}>
          {currency(t.estimatedAmountDue)}
        </Text>
      </View>
    </View>
  );
}

function Footer({ ctx }: { ctx: Ctx }) {
  return (
    <Text style={s.footer} fixed>
      {ctx.settings.venueName} · Order #{ctx.contract.orderNumber} · Generated{" "}
      {new Date().toLocaleDateString("en-US")}
    </Text>
  );
}

const itemsOf = (ctx: Ctx, section: string) =>
  ctx.contract.lineItems.filter((i) => i.section === section);

/* ---------------- documents ---------------- */

/** KITCHEN — food prep only, quantities & notes, never prices */
function KitchenSheet({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  return (
    <Document title={`Kitchen Sheet #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Kitchen Sheet" audience="Kitchen Team" />
        <Text style={s.badge}>SERVICE: {fmtDate(c.date)}</Text>
        <View style={{ marginTop: 8 }}>
          <InfoRow
            label="Service Window"
            value={`${formatTime(c.startTime)} – ${formatTime(c.endTime)}`}
          />
          {c.setupTime ? (
            <InfoRow label="Setup From" value={formatTime(c.setupTime)} />
          ) : null}
          <InfoRow label="Guest Count" value={String(c.expectedGuests || "TBD")} />
          <InfoRow label="Area(s)" value={areaNames(ctx)} />
          <InfoRow label="Event" value={c.eventName} />
        </View>

        <ItemsTable
          items={itemsOf(ctx, "food")}
          title="Food — Prep List"
          showPrices={false}
        />
        <ItemsTable
          items={itemsOf(ctx, "beverage")}
          title="Beverage — For Reference"
          showPrices={false}
        />

        {c.specialInstructions ? (
          <View>
            <Text style={s.sectionTitle}>Special Instructions / Allergies</Text>
            <Text>{c.specialInstructions}</Text>
          </View>
        ) : null}
        {c.kitchenNotes ? (
          <View>
            <Text style={s.sectionTitle}>Kitchen Notes</Text>
            <Text>{c.kitchenNotes}</Text>
          </View>
        ) : null}
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/** STAFF / OPERATIONS — the full run sheet */
function BanquetEventOrder({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  return (
    <Document title={`BEO #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Banquet Event Order" audience="Staff / Operations" />
        <EventSummary ctx={ctx} />
        <ClientBlock ctx={ctx} />

        <ItemsTable items={itemsOf(ctx, "food")} title="Food" showPrices />
        <ItemsTable items={itemsOf(ctx, "beverage")} title="Beverage" showPrices />
        <ItemsTable items={itemsOf(ctx, "other")} title="Other Items" showPrices />

        {c.specialInstructions ? (
          <View>
            <Text style={s.sectionTitle}>Special Instructions</Text>
            <Text>{c.specialInstructions}</Text>
          </View>
        ) : null}
        {c.setupNotes ? (
          <View>
            <Text style={s.sectionTitle}>Setup</Text>
            <Text>{c.setupNotes}</Text>
          </View>
        ) : null}

        <TotalsBlock ctx={ctx} />

        <View style={s.signBlock}>
          <Text style={s.signLine}>Client Signature / Date</Text>
          <Text style={s.signLine}>Manager Signature / Date</Text>
        </View>
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/** MANAGER & CLIENT — agreement, billing summary, terms, signatures */
function ContractDoc({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  const o = owner(ctx);
  return (
    <Document title={`Contract #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Event Contract" audience="Manager & Client" />

        <Text>
          {`This agreement is made between ${ctx.settings.venueName} (the "Restaurant") and ${
            c.contactSnapshot.companyName || c.contactSnapshot.name
          } (the "Client") for the event described below.`}
        </Text>

        <EventSummary ctx={ctx} />
        <ClientBlock ctx={ctx} />

        <Text style={s.sectionTitle}>Financial Summary</Text>
        <TotalsBlock ctx={ctx} />
        {c.billingNotes ? (
          <View>
            <Text style={s.sectionTitle}>Billing Notes</Text>
            <Text>{c.billingNotes}</Text>
          </View>
        ) : null}

        <Text style={s.sectionTitle}>Terms &amp; Conditions</Text>
        <Text style={s.terms}>{c.termsAndConditions}</Text>

        <View style={s.signBlock}>
          <Text style={s.signLine}>
            Client: {c.contactSnapshot.name} — Signature / Date
          </Text>
          <Text style={s.signLine}>
            Restaurant: {o?.name ?? "Manager"} — Signature / Date
          </Text>
        </View>
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/** CLIENT / BILLING — itemized invoice */
function InvoiceDoc({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  return (
    <Document title={`Invoice #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Invoice" audience="Client / Billing" />
        <ClientBlock ctx={ctx} />
        <View style={{ marginTop: 4 }}>
          <InfoRow label="Event Date" value={fmtDate(c.date)} />
          {c.billing.depositDueDate ? (
            <InfoRow label="Deposit Due" value={fmtDate(c.billing.depositDueDate)} />
          ) : null}
          {c.billing.balanceDueDate ? (
            <InfoRow label="Balance Due" value={fmtDate(c.billing.balanceDueDate)} />
          ) : null}
        </View>

        <ItemsTable items={itemsOf(ctx, "food")} title="Food" showPrices showNotes={false} />
        <ItemsTable items={itemsOf(ctx, "beverage")} title="Beverage" showPrices showNotes={false} />
        <ItemsTable items={itemsOf(ctx, "other")} title="Other Items" showPrices showNotes={false} />

        <TotalsBlock ctx={ctx} />
        {c.billingNotes ? (
          <View>
            <Text style={s.sectionTitle}>Notes</Text>
            <Text>{c.billingNotes}</Text>
          </View>
        ) : null}
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/** CLIENT — menu with descriptions */
function MenuDoc({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  const sections: { title: string; items: ContractLineItem[] }[] = [
    { title: "Food", items: itemsOf(ctx, "food") },
    { title: "Beverage", items: itemsOf(ctx, "beverage") },
  ];
  return (
    <Document title={`Menu #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Event Menu" audience="Client" />
        <Text style={{ textAlign: "center", fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 4 }}>
          {c.eventName}
        </Text>
        <Text style={{ textAlign: "center", color: "#666", marginBottom: 6 }}>
          {fmtDate(c.date)} · {formatTime(c.startTime)} – {formatTime(c.endTime)}
        </Text>
        {sections.map((sec) =>
          sec.items.length ? (
            <View key={sec.title}>
              <Text style={[s.sectionTitle, { textAlign: "center" }]}>
                {sec.title}
              </Text>
              {sec.items.map((item) => (
                <View key={item.id} style={{ marginBottom: 6, alignItems: "center" }}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>
                    {item.description}
                  </Text>
                  {item.altDescription ? (
                    <Text style={[s.note, { textAlign: "center" }]}>
                      {item.altDescription}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : null
        )}
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/** CLIENT — proposal / offer summary */
function ProposalDoc({ ctx }: { ctx: Ctx }) {
  const c = ctx.contract;
  const o = owner(ctx);
  return (
    <Document title={`Proposal #${c.orderNumber}`}>
      <Page size="LETTER" style={s.page}>
        <Header ctx={ctx} title="Event Proposal" audience="Client" />
        <Text>
          {`Dear ${c.contactSnapshot.firstName || c.contactSnapshot.name},`}
        </Text>
        <Text style={{ marginTop: 4 }}>
          {`Thank you for considering ${ctx.settings.venueName} for your upcoming event. Below is our proposal based on your requirements — we would be delighted to host you.`}
        </Text>

        <EventSummary ctx={ctx} showOwner={false} />

        <ItemsTable items={itemsOf(ctx, "food")} title="Proposed Food" showPrices />
        <ItemsTable items={itemsOf(ctx, "beverage")} title="Proposed Beverage" showPrices />
        <ItemsTable items={itemsOf(ctx, "other")} title="Additional Items" showPrices />

        <Text style={s.sectionTitle}>Estimated Investment</Text>
        <TotalsBlock ctx={ctx} />

        <Text style={{ marginTop: 12 }}>
          This proposal is valid for 14 days. To confirm your reservation, a
          signed contract and deposit are required.
        </Text>
        {o ? (
          <Text style={{ marginTop: 10 }}>
            Warm regards,{"\n"}
            {o.name}
            {o.email ? ` · ${o.email}` : ""}
          </Text>
        ) : null}
        <Footer ctx={ctx} />
      </Page>
    </Document>
  );
}

/* ---------------- entry point ---------------- */

export function buildContractPdf(
  slug: string,
  contract: Contract,
  settings: RestaurantSettings
): React.ReactElement<React.ComponentProps<typeof Document>> | null {
  const ctx = { contract, settings };
  switch (slug) {
    case "kitchen-sheet":
      return <KitchenSheet ctx={ctx} />;
    case "banquet-event-order":
      return <BanquetEventOrder ctx={ctx} />;
    case "contract":
      return <ContractDoc ctx={ctx} />;
    case "invoice":
      return <InvoiceDoc ctx={ctx} />;
    case "menu":
      return <MenuDoc ctx={ctx} />;
    case "proposal":
      return <ProposalDoc ctx={ctx} />;
    default:
      return null;
  }
}
