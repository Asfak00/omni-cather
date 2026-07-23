"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, Loader2, MapPin, User, Users } from "lucide-react";
import type { Contract, RestaurantSettings } from "@/types";
import { computeTotals, formatTime } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { StatusBadge } from "./status-badge";
import { ContactValue } from "@/components/shared/contact-value";
import { ContactInfoBlock } from "./contact-info-block";
import { EventsTableBlock } from "./events-table-block";
import { LineItemsSection } from "./line-items-section";
import { BillingWidget } from "./billing-widget";

interface Props {
  initialContract: Contract;
  settings: RestaurantSettings;
  ghlContactUrl?: string;
}

export function ContractEditor({ initialContract, settings, ghlContactUrl }: Props) {
  const router = useRouter();
  const [contract, setContract] = React.useState<Contract>(initialContract);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const update = React.useCallback((patch: Partial<Contract>) => {
    setContract((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);

  const totals = React.useMemo(
    () =>
      computeTotals(contract.lineItems, contract.billing, {
        expectedGuests: contract.expectedGuests,
        payments: contract.payments,
      }),
    [contract.lineItems, contract.billing, contract.expectedGuests, contract.payments]
  );

  const areaNames = contract.areaIds
    .map((id) => settings.areas.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");
  const c = contract.contactSnapshot;

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      toast.success("Contract updated");
      router.push(`/events/${contract.id}?tab=docs`);
    } catch {
      toast.error("Failed to save contract");
      setSaving(false);
    }
  }

  const SECTIONS = [
    { id: "sec-contact", label: "Contact Info" },
    { id: "sec-instructions", label: "Instructions" },
    { id: "sec-food", label: "Food" },
    { id: "sec-beverage", label: "Beverage" },
    { id: "sec-other", label: "Other Items" },
    { id: "sec-kitchen", label: "Kitchen" },
    { id: "sec-setup", label: "Setup" },
    { id: "sec-billing", label: "Billing" },
    { id: "sec-terms", label: "Terms" },
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* header */}
      <div>
        <Link
          href={`/events/${contract.id}?tab=docs`}
          className="mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to event
        </Link>
        <h1>Editing Contract &amp; Event Order: {contract.orderNumber}</h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <StatusBadge status={contract.status} />
            <Link
              href={`/events/${contract.id}`}
              className="font-medium text-foreground hover:underline"
            >
              {contract.eventName}
            </Link>
          </span>
          {contract.date && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {format(new Date(`${contract.date}T00:00:00`), "EEE, MMM d, yyyy")} •{" "}
              {formatTime(contract.startTime)} – {formatTime(contract.endTime)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {settings.venueName}
            {areaNames && ` • ${areaNames}`}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="size-4" />
            {contract.expectedGuests || 0} guests expected
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <User className="size-4" />
            <ContactValue type="link" value={c.name} href={ghlContactUrl} />
            {c.companyName && <span>of {c.companyName}</span>}
            {c.phone && (
              <>
                <span>•</span> <ContactValue type="phone" value={c.phone} />
              </>
            )}
            {c.email && (
              <>
                <span>•</span> <ContactValue type="email" value={c.email} />
              </>
            )}
          </span>
        </div>
      </div>

      {/* section quick-nav */}
      <div className="sticky top-0 z-10 -mx-1 flex gap-1.5 overflow-x-auto rounded-lg border bg-card/95 p-1.5 backdrop-blur">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {s.label}
          </a>
        ))}
      </div>

      <div id="sec-contact" className="scroll-mt-20 space-y-4">
        <ContactInfoBlock
          contract={contract}
          settings={settings}
          ghlContactUrl={ghlContactUrl}
        />
        <EventsTableBlock contract={contract} settings={settings} />
      </div>

      <Card id="sec-instructions" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-primary">Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={3}
            placeholder="Dietary restrictions, timing notes, AV needs..."
            value={contract.specialInstructions}
            onChange={(v) => update({ specialInstructions: v })}
          />
        </CardContent>
      </Card>

      <div id="sec-food" className="scroll-mt-20">
        <LineItemsSection
          section="food"
          items={contract.lineItems}
          menus={settings.menus.filter((m) => !m.deleted)}
          categories={settings.categories}
          expectedGuests={contract.expectedGuests}
          onItemsChange={(lineItems) => update({ lineItems })}
        />
      </div>
      <div id="sec-beverage" className="scroll-mt-20">
        <LineItemsSection
          section="beverage"
          items={contract.lineItems}
          menus={settings.menus.filter((m) => !m.deleted)}
          categories={settings.categories}
          expectedGuests={contract.expectedGuests}
          onItemsChange={(lineItems) => update({ lineItems })}
        />
      </div>
      <div id="sec-other" className="scroll-mt-20">
        <LineItemsSection
          section="other"
          items={contract.lineItems}
          menus={settings.menus.filter((m) => !m.deleted)}
          categories={settings.categories}
          expectedGuests={contract.expectedGuests}
          onItemsChange={(lineItems) => update({ lineItems })}
        />
      </div>

      {/* Kitchen Notes — extracted into the Kitchen Sheet PDF */}
      <Card id="sec-kitchen" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-primary">Kitchen Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={3}
            placeholder="Prep notes for the kitchen team — allergies, plating, timing..."
            value={contract.kitchenNotes ?? ""}
            onChange={(v) => update({ kitchenNotes: v })}
          />
        </CardContent>
      </Card>

      {/* Setup — extracted into the Banquet Event Order PDF */}
      <Card id="sec-setup" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-primary">Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={3}
            placeholder="Room setup for staff — tables, AV, decorations, floor plan..."
            value={contract.setupNotes ?? ""}
            onChange={(v) => update({ setupNotes: v })}
          />
        </CardContent>
      </Card>

      <div id="sec-billing" className="scroll-mt-20 space-y-4">
        <BillingWidget contract={contract} totals={totals} onChange={update} />
      </div>

      <Card id="sec-terms" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="text-primary">Terms &amp; Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={12}
            value={contract.termsAndConditions}
            onChange={(v) => update({ termsAndConditions: v })}
          />
        </CardContent>
      </Card>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur md:left-64">
        <div className="flex items-center justify-between gap-3 px-6 py-3">
          <p className="text-sm text-muted-foreground">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${contract.id}?tab=docs`)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Update
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
