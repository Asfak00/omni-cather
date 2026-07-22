"use client";

import type { Contract, RestaurantSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Read-only "Contact Info" merge block — mirrors the doc template:
 * account / contact / email / phone / address on the left,
 * sales manager info on the right.
 */
export function ContactInfoBlock({
  contract,
  settings,
}: {
  contract: Contract;
  settings: RestaurantSettings;
}) {
  const c = contract.contactSnapshot;
  const owner = settings.owners.find((o) => o.id === contract.ownerId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Contact Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-x-8 gap-y-1 text-sm sm:grid-cols-2">
          <div className="space-y-1">
            <InfoRow label="ACCOUNT" value={c.companyName ?? "—"} />
            <InfoRow label="CONTACT" value={c.name} />
            <InfoRow
              label="EMAIL"
              value={c.email ?? "—"}
              href={c.email ? `mailto:${c.email}` : undefined}
            />
            <InfoRow label="PHONE" value={c.phone ?? "—"} />
            <InfoRow
              label="ADDRESS"
              value={
                [c.address, c.city, c.state].filter(Boolean).join(", ") || "—"
              }
            />
          </div>
          <div className="space-y-1 sm:text-right">
            <InfoRow label="SALES MANAGER" value={owner?.name ?? "—"} right />
            <InfoRow
              label="EMAIL"
              value={owner?.email ?? "—"}
              href={owner?.email ? `mailto:${owner.email}` : undefined}
              right
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  href,
  right,
}: {
  label: string;
  value: string;
  href?: string;
  right?: boolean;
}) {
  return (
    <p className={right ? "sm:text-right" : ""}>
      <span className="font-bold">{label}:</span>{" "}
      {href ? (
        <a href={href} className="text-primary underline">
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </p>
  );
}
