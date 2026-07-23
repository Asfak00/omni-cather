"use client";

import type { Contract, RestaurantSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactValue } from "@/components/shared/contact-value";

/**
 * "Contact Info" merge block — mirrors the doc template: client info
 * on the left pane, sales manager on the right pane, dotted cell
 * borders like the merge-field template. Every email/phone is a
 * working mailto:/tel: link; the contact name opens GHL.
 */
export function ContactInfoBlock({
  contract,
  settings,
  ghlContactUrl,
}: {
  contract: Contract;
  settings: RestaurantSettings;
  ghlContactUrl?: string;
}) {
  const c = contract.contactSnapshot;
  const owner = settings.owners.find((o) => o.id === contract.ownerId);
  const address = [c.address, c.city, c.state].filter(Boolean).join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Contact Info</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid overflow-hidden rounded-md border text-sm sm:grid-cols-2">
          {/* left pane — client */}
          <div className="divide-y divide-dashed border-b border-dashed sm:border-b-0 sm:border-r">
            <InfoCell label="ACCOUNT">
              {c.companyName ? (
                <ContactValue type="link" value={c.companyName} href={ghlContactUrl} />
              ) : (
                "—"
              )}
            </InfoCell>
            <InfoCell label="CONTACT">
              <ContactValue type="link" value={c.name} href={ghlContactUrl} />
            </InfoCell>
            <InfoCell label="EMAIL">
              {c.email ? <ContactValue type="email" value={c.email} /> : "—"}
            </InfoCell>
            <InfoCell label="PHONE">
              {c.phone ? <ContactValue type="phone" value={c.phone} /> : "—"}
            </InfoCell>
            <InfoCell label="ADDRESS">
              {address ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener"
                  className="text-primary hover:underline"
                >
                  {address}
                </a>
              ) : (
                "—"
              )}
            </InfoCell>
          </div>

          {/* right pane — sales manager */}
          <div className="divide-y divide-dashed">
            <InfoCell label="SALES MANAGER" right>
              {owner?.name ?? "—"}
            </InfoCell>
            <InfoCell label="EMAIL" right>
              {owner?.email ? <ContactValue type="email" value={owner.email} /> : "—"}
            </InfoCell>
            <InfoCell label="PHONE" right>
              <ContactValue type="phone" value="917-386-4109" />
            </InfoCell>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoCell({
  label,
  right,
  children,
}: {
  label: string;
  right?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 ${right ? "sm:justify-end" : ""}`}
    >
      <span className="font-bold">{label}:</span>
      <span>{children}</span>
    </div>
  );
}
