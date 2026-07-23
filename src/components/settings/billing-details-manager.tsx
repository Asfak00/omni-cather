"use client";

import * as React from "react";
import { AlertCircle, Plus, Trash2, Undo2 } from "lucide-react";
import type { BillingDetailSetting, RestaurantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function randomId() {
  return `bd_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** "8.875%" → rate for the calculation engine */
export function parseRate(value: string): number | null {
  const m = value.trim().match(/^([\d.]+)\s*%$/);
  return m ? Number(m[1]) : null;
}

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function BillingDetailsManager({ settings, onChange }: Props) {
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const details = settings.billingDetails;
  const editing = details.find((d) => d.id === editingId);

  /** patch a detail, keeping settings.taxes in sync for builtins */
  const patchDetail = (id: string, patch: Partial<BillingDetailSetting>) => {
    const next = details.map((d) => (d.id === id ? { ...d, ...patch } : d));
    const taxes = { ...settings.taxes };
    for (const d of next) {
      if (!d.builtin) continue;
      const rate = parseRate(d.overridingValue || d.defaultValue);
      if (rate === null) continue;
      if (d.builtin === "Sales Tax") taxes.salesTaxRate = rate;
      if (d.builtin === "Gratuity") taxes.gratuityRate = rate;
      if (d.builtin === "Admin Fee") taxes.adminFeeRate = rate;
    }
    onChange({ billingDetails: next, taxes });
  };

  const addDetail = () => {
    const detail: BillingDetailSetting = {
      id: randomId(),
      description: "",
      internalName: "",
      defaultValue: "",
      inclusive: false,
      locations: [settings.venueName],
      associated: [],
    };
    onChange({ billingDetails: [...details, detail] });
    setEditingId(detail.id);
  };

  /* ---------------- editor ---------------- */
  if (editing) {
    const isNew = !editing.description;
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <h2 className="text-lg font-semibold">
            {isNew ? "New" : "Edit"} Document Billing Detail
          </h2>

          <div className="max-w-2xl space-y-4">
            <FieldRow label="Description">
              <Input
                value={editing.description}
                onChange={(e) =>
                  patchDetail(editing.id, { description: e.target.value })
                }
              />
              <Hint>
                Customer-facing name, e.g., &quot;Sales Tax&quot; or
                &quot;Gratuity&quot;
              </Hint>
            </FieldRow>

            <FieldRow label="Internal Name">
              <Input
                value={editing.internalName ?? ""}
                onChange={(e) =>
                  patchDetail(editing.id, { internalName: e.target.value })
                }
              />
              <Hint>
                Naming reference for internal purposes, e.g., &quot;Sales Tax
                Location 1&quot;
              </Hint>
            </FieldRow>

            <FieldRow label="Default Value">
              <Input
                value={editing.defaultValue}
                onChange={(e) =>
                  patchDetail(editing.id, { defaultValue: e.target.value })
                }
                placeholder='e.g. "15.5%" or "500"'
              />
              <Hint>
                A dollar amount or a percentage - e.g., &quot;15.5%&quot; or
                &quot;500&quot;.
              </Hint>
              <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>
                  Be sure to include a % sign for all values that are
                  percentages! The Default Value will be used for any location
                  that is selected but does not have an overriding value
                  supplied.
                </span>
              </div>
            </FieldRow>

            <FieldRow label="">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={editing.inclusive ?? false}
                  onCheckedChange={(v) =>
                    patchDetail(editing.id, { inclusive: v === true })
                  }
                />
                Inclusive
              </label>
            </FieldRow>
          </div>

          {/* locations */}
          <div className="grid max-w-2xl gap-6 border-t pt-4 sm:grid-cols-2">
            <div>
              <Label className="font-semibold">Location</Label>
              <div className="mt-2 space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    patchDetail(editing.id, { locations: [settings.venueName] })
                  }
                >
                  Select All Locations
                </Button>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={(editing.locations ?? []).includes(settings.venueName)}
                    onCheckedChange={(v) =>
                      patchDetail(editing.id, {
                        locations: v === true ? [settings.venueName] : [],
                      })
                    }
                  />
                  {settings.venueName}
                </label>
              </div>
            </div>
            <div>
              <Label className="font-semibold">Overriding Value</Label>
              <Input
                className="mt-2"
                value={editing.overridingValue ?? ""}
                onChange={(e) =>
                  patchDetail(editing.id, { overridingValue: e.target.value })
                }
              />
            </div>
          </div>

          {/* associated billing details */}
          <div className="max-w-2xl border-t pt-4">
            <h3 className="mb-3 font-semibold">
              Default Associated Billing Details
            </h3>
            <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              The following billing details will be selected by default when
              this Billing Detail is used. This is only useful if this Billing
              Detail is a percentage based fee. It enables the total from
              another Billing Detail to be included in the calculation for this
              Billing Detail. E.g., if you apply an administration fee on top
              of Sales Tax. This is a fairly advanced feature, so if you need
              help, please contact support!
            </div>
            <div className="mt-4 space-y-2">
              {details
                .filter((d) => !d.deleted && d.id !== editing.id && d.description)
                .map((other) => (
                  <label
                    key={other.id}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={(editing.associated ?? []).includes(
                        other.description
                      )}
                      onCheckedChange={(v) =>
                        patchDetail(editing.id, {
                          associated:
                            v === true
                              ? [...(editing.associated ?? []), other.description]
                              : (editing.associated ?? []).filter(
                                  (a) => a !== other.description
                                ),
                        })
                      }
                    />
                    {other.description}
                  </label>
                ))}
            </div>
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button onClick={() => setEditingId(null)}>
              {isNew ? "Create" : "Update"}
            </Button>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- list ---------------- */
  const visible = details.filter((d) => showDeleted || !d.deleted);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={showDeleted}
              onCheckedChange={(v) => setShowDeleted(v === true)}
            />
            Show deleted billings
          </label>
          <Button onClick={addDetail}>
            <Plus className="size-4" /> New Billing Detail
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-4 py-2 text-sm font-semibold text-muted-foreground">
            Name
          </div>
          {visible.map((detail, i) => (
            <div
              key={detail.id}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5",
                i % 2 === 0 && "bg-muted/30",
                detail.deleted && "opacity-50"
              )}
            >
              <span className="flex-1 text-sm">
                {detail.description || "(untitled)"}
                <span className="ml-2 text-xs text-muted-foreground">
                  {detail.overridingValue || detail.defaultValue}
                  {detail.deleted && " · deleted"}
                </span>
              </span>
              {!detail.deleted ? (
                <>
                  <Button size="sm" onClick={() => setEditingId(detail.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-destructive"
                    disabled={Boolean(detail.builtin)}
                    title={
                      detail.builtin
                        ? "Built-in billing details cannot be deleted"
                        : "Delete"
                    }
                    onClick={() => patchDetail(detail.id, { deleted: true })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => patchDetail(detail.id, { deleted: false })}
                >
                  <Undo2 className="size-3.5" /> Restore
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-start gap-4">
      <Label className="justify-end pt-2.5 text-right font-semibold">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs text-muted-foreground">{children}</p>;
}
