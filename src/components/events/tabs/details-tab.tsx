"use client";

import { format } from "date-fns";
import { Building2 } from "lucide-react";
import type { Contract, ContractTotals, RestaurantSettings } from "@/types";
import { currency } from "@/lib/calculations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ContactValue } from "@/components/shared/contact-value";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  contract: Contract;
  settings: RestaurantSettings;
  totals: ContractTotals;
  ghlContactUrl?: string;
}

export function DetailsTab({ contract, settings, totals, ghlContactUrl }: Props) {
  const c = contract.contactSnapshot;
  const owner = settings.owners.find((o) => o.id === contract.ownerId);
  const managers = (contract.managerIds ?? [])
    .map((id) => settings.owners.find((o) => o.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const fmtDateTime = (iso: string) =>
    format(new Date(iso), "EEE, MMM d, yyyy h:mm a");
  const fmtDate = (d?: string) =>
    d ? format(new Date(`${d}T00:00:00`), "M/d/yyyy") : "";

  return (
    <Card>
      <CardContent className="space-y-8 pt-6">
        {/* Contacts */}
        <Section title="Contacts">
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            <Row
              label="Account"
              value={
                c.companyName ? (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-4 text-primary" />
                    <ContactValue
                      type="link"
                      value={c.companyName}
                      href={ghlContactUrl}
                    />
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Contact"
              value={
                <span className="flex items-start gap-2.5">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
                      {initials(c.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="leading-tight">
                    <ContactValue
                      type="link"
                      value={c.name}
                      href={ghlContactUrl}
                      className="block"
                    />
                    {c.phone && (
                      <ContactValue
                        type="phone"
                        value={c.phone}
                        className="block text-sm text-muted-foreground hover:text-primary"
                      />
                    )}
                    {c.email && (
                      <ContactValue
                        type="email"
                        value={c.email}
                        className="block text-sm underline"
                      />
                    )}
                  </span>
                </span>
              }
            />
          </div>
        </Section>

        {/* Additional Details */}
        <Section title="Additional Details">
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Row
                label="# Expected Guests"
                value={contract.expectedGuests || "—"}
              />
              <Row
                label="# Guaranteed Guests"
                value={contract.guaranteedGuests || ""}
              />
              <Row label="Meal Periods" value={contract.mealPeriods || ""} />
              <Row
                label="Lead Sources"
                value={(contract.leadSources ?? []).join(", ")}
              />
              <Row
                label="Lead"
                value={
                  <Badge className="bg-teal-100 font-medium text-teal-800">
                    L&nbsp;&nbsp;{c.name}
                  </Badge>
                }
              />
              <Row label="Referred By" value={contract.referredBy || ""} />
            </div>
            <div className="space-y-2">
              <Row label="Owner" value={owner?.name ?? "—"} />
              {managers && <Row label="Managers" value={managers} />}
              <Row label="Created On" value={fmtDateTime(contract.createdAt)} />
              <Row label="Updated At" value={fmtDateTime(contract.updatedAt)} />
            </div>
          </div>
        </Section>

        {/* Financials */}
        <Section title="Financials">
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Row
                label="F&B Minimum"
                value={currency(contract.billing.fbMinimum || 0)}
              />
              <Row
                label="Rental Fee"
                value={currency(contract.billing.roomRental || 0)}
              />
              <Row label="Forecast" value="" />
              <Row
                label="Deposit"
                value={
                  <span className="flex items-center gap-2">
                    {currency(totals.deposit)}
                    <Badge
                      className={cn(
                        contract.billing.depositPaid
                          ? "bg-emerald-600"
                          : "bg-foreground/80"
                      )}
                    >
                      {contract.billing.depositPaid ? "Paid" : "Unpaid"}
                    </Badge>
                  </span>
                }
              />
              <Row label="Actual Amount" value={currency(totals.subtotal)} />
            </div>
            <div className="space-y-2">
              <Row label="Grand Total" value={currency(totals.grandTotal)} />
              <Row
                label="Amount Due"
                value={
                  <span>
                    <span className="block">{currency(totals.remaining)}</span>
                    <span className="block text-sm text-muted-foreground">
                      -{currency(totals.paid)} Paid                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {currency(totals.remaining)} Remaining                    </span>
                  </span>
                }
              />
              <Row
                label="Price Per Person"
                value={totals.pricePerPerson ? currency(totals.pricePerPerson) : "—"}
              />
            </div>
          </div>
        </Section>

        {/* Custom Fields */}
        <Section title="Custom Fields">
          <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
            <Row
              label="Deposit Due Date"
              value={fmtDate(contract.billing.depositDueDate)}
            />
            <Row
              label="Balance Due Date"
              value={fmtDate(contract.billing.balanceDueDate)}
            />
          </div>
        </Section>

        {/* Additional Information */}
        <Section title="Additional Information">
          <p className="text-sm">
            {contract.additionalInformation || (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
        </Section>

        <Section title="Referred By">
          <p className="text-sm">
            {contract.referredBy || (
              <span className="text-muted-foreground">—</span>
            )}
          </p>
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 border-b pb-2 font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-start gap-3 text-sm">
      <span className="text-right font-bold text-foreground/80">{label}</span>
      <span>{value}</span>
    </div>
  );
}
