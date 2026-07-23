"use client";

import * as React from "react";
import { Plus, Trash2, Undo2 } from "lucide-react";
import type { ApplicableCharge, ItemCategory, RestaurantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function randomId() {
  return `cat_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function CategoriesManager({ settings, onChange }: Props) {
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const categories = settings.categories;
  const editing = categories.find((c) => c.id === editingId);

  const patchCategory = (id: string, patch: Partial<ItemCategory>) =>
    onChange({
      categories: categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const addCategory = () => {
    const cat: ItemCategory = {
      id: randomId(),
      name: "New Category",
      internalName: "",
      defaultCharges: [],
    };
    onChange({ categories: [...categories, cat] });
    setEditingId(cat.id);
  };

  /* ---------------- editor ---------------- */
  if (editing) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <h2 className="text-lg font-semibold">
            Editing {editing.name} Category
          </h2>

          <div className="max-w-xl space-y-4">
            <div>
              <Label className="font-semibold">Name</Label>
              <Input
                className="mt-1.5"
                value={editing.name}
                onChange={(e) => patchCategory(editing.id, { name: e.target.value })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Customer-facing e.g. &quot;Food&quot; or &quot;Beverages&quot;
              </p>
            </div>
            <div>
              <Label className="font-semibold">Internal name</Label>
              <Input
                className="mt-1.5"
                value={editing.internalName ?? ""}
                onChange={(e) =>
                  patchCategory(editing.id, { internalName: e.target.value })
                }
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Naming reference for internal purposes, e.g., &quot;Food for
                Location 1&quot;
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-base font-semibold text-primary">
              Default Billing Details
            </h3>
            <div className="rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              The following billing details will be selected by default when
              this Category is selected for a Picklist Item. E.g., if items
              marked with this category should always be included in the
              Billing Items &quot;Sales Tax&quot; and &quot;Gratuity&quot; then
              both of those Billing Items should be selected.
            </div>
            <div className="mt-4 space-y-2">
              {settings.billingDetails
                .filter((d) => !d.deleted && d.builtin)
                .map((detail) => {
                  const charge = detail.builtin as ApplicableCharge;
                  const checked = editing.defaultCharges.includes(charge);
                  return (
                    <label
                      key={detail.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) =>
                          patchCategory(editing.id, {
                            defaultCharges:
                              v === true
                                ? [...editing.defaultCharges, charge]
                                : editing.defaultCharges.filter(
                                    (c) => c !== charge
                                  ),
                          })
                        }
                      />
                      {detail.description}
                    </label>
                  );
                })}
            </div>
          </div>

          <div className="flex gap-2 border-t pt-4">
            <Button onClick={() => setEditingId(null)}>Update</Button>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- list ---------------- */
  const visible = categories.filter((c) => showDeleted || !c.deleted);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={showDeleted}
              onCheckedChange={(v) => setShowDeleted(v === true)}
            />
            Show deleted
          </label>
          <Button onClick={addCategory}>
            <Plus className="size-4" /> New Menu Item Category
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-4 py-2 text-sm font-semibold text-muted-foreground">
            Name
          </div>
          {visible.map((cat, i) => (
            <div
              key={cat.id}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5",
                i % 2 === 0 && "bg-muted/30",
                cat.deleted && "opacity-50"
              )}
            >
              <span className="flex-1 text-sm">
                {cat.name}
                {cat.deleted && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (deleted)
                  </span>
                )}
              </span>
              {!cat.deleted ? (
                <>
                  <Button size="sm" onClick={() => setEditingId(cat.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => patchCategory(cat.id, { deleted: true })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => patchCategory(cat.id, { deleted: false })}
                >
                  <Undo2 className="size-3.5" /> Restore
                </Button>
              )}
            </div>
          ))}
          {visible.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No categories yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
