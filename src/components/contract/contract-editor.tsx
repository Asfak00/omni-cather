"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Files, Loader2, Save } from "lucide-react";
import type { Contract, RestaurantSettings } from "@/types";
import { computeTotals } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "./status-badge";
import { EventDetailsSection } from "./event-details-section";
import { ContactsSection } from "./contacts-section";
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
    () => computeTotals(contract.lineItems, contract.billing),
    [contract.lineItems, contract.billing]
  );

  async function save(goToDocs: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      toast.success("Contract saved");
      if (goToDocs) router.push(`/contracts/${contract.id}/docs`);
    } catch {
      toast.error("Failed to save contract");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 pb-24">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1>Contract &amp; Event Order: {contract.orderNumber}</h1>
            <StatusBadge status={contract.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Converting from{" "}
            <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-teal-700">
              Lead
            </span>{" "}
            {contract.contactSnapshot.name}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push("/contracts")}>
          <ArrowLeft className="size-4" /> All contracts
        </Button>
      </div>

      <EventDetailsSection contract={contract} settings={settings} onChange={update} />
      <ContactsSection contract={contract} onChange={update} />
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

      <BillingWidget contract={contract} totals={totals} onChange={update} />

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Terms &amp; Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={10}
            className="font-mono text-xs leading-relaxed"
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
              onClick={() => router.push("/contracts")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => save(false)}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save
            </Button>
            <Button onClick={() => save(true)} disabled={saving}>
              <Files className="size-4" />
              Save &amp; View Docs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
