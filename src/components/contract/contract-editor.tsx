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
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./status-badge";
import { ContactInfoBlock } from "./contact-info-block";
import { EventsTableBlock } from "./events-table-block";
import { LineItemsSection } from "./line-items-section";
import { BillingWidget } from "./billing-widget";

interface Props {
  initialContract: Contract;
  settings: RestaurantSettings;
}

export function ContractEditor({ initialContract, settings }: Props) {
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

  return (
    <div className="space-y-4 pb-24">
      {/* header */}
      <div>
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
          <span className="flex items-center gap-1.5">
            <User className="size-4" />
            {c.name}
            {c.companyName && ` of ${c.companyName}`}
            {c.phone && ` • ${c.phone}`}
            {c.email && ` • ${c.email}`}
          </span>
        </div>
      </div>

      <ContactInfoBlock contract={contract} settings={settings} />
      <EventsTableBlock contract={contract} settings={settings} />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Special Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            placeholder="Dietary restrictions, timing notes, AV needs..."
            value={contract.specialInstructions}
            onChange={(e) => update({ specialInstructions: e.target.value })}
          />
        </CardContent>
      </Card>

      <LineItemsSection
        section="food"
        items={contract.lineItems}
        menus={settings.menus}
        expectedGuests={contract.expectedGuests}
        onItemsChange={(lineItems) => update({ lineItems })}
      />
      <LineItemsSection
        section="beverage"
        items={contract.lineItems}
        menus={settings.menus}
        expectedGuests={contract.expectedGuests}
        onItemsChange={(lineItems) => update({ lineItems })}
      />
      <LineItemsSection
        section="other"
        items={contract.lineItems}
        menus={settings.menus}
        expectedGuests={contract.expectedGuests}
        onItemsChange={(lineItems) => update({ lineItems })}
      />

      {/* Kitchen Notes — extracted into the Kitchen Sheet PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Kitchen Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            placeholder="Prep notes for the kitchen team — allergies, plating, timing..."
            value={contract.kitchenNotes ?? ""}
            onChange={(e) => update({ kitchenNotes: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Setup — extracted into the Banquet Event Order PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Setup</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            placeholder="Room setup for staff — tables, AV, decorations, floor plan..."
            value={contract.setupNotes ?? ""}
            onChange={(e) => update({ setupNotes: e.target.value })}
          />
        </CardContent>
      </Card>

      <BillingWidget contract={contract} totals={totals} onChange={update} />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Terms &amp; Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={12}
            className="text-sm leading-relaxed"
            value={contract.termsAndConditions}
            onChange={(e) => update({ termsAndConditions: e.target.value })}
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
