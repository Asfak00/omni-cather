"use client";

import { Plus, Trash2 } from "lucide-react";
import type { RestaurantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

function randomId() {
  return `owner_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function GeneralSettings({ settings, onChange }: Props) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <Label className="text-sm">Venue name</Label>
          <Input
            className="mt-1 max-w-sm"
            value={settings.venueName}
            onChange={(e) => onChange({ venueName: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Owners / Sales Managers</CardTitle>
          <CardDescription>
            Selectable as event owner; shown as Sales Manager on documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {settings.owners.map((owner) => (
            <div
              key={owner.id}
              className="grid grid-cols-[1fr_1fr_32px] items-center gap-2"
            >
              <Input
                placeholder="Name"
                value={owner.name}
                onChange={(e) =>
                  onChange({
                    owners: settings.owners.map((o) =>
                      o.id === owner.id ? { ...o, name: e.target.value } : o
                    ),
                  })
                }
              />
              <Input
                placeholder="Email"
                type="email"
                value={owner.email ?? ""}
                onChange={(e) =>
                  onChange({
                    owners: settings.owners.map((o) =>
                      o.id === owner.id ? { ...o, email: e.target.value } : o
                    ),
                  })
                }
              />
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() =>
                  onChange({
                    owners: settings.owners.filter((o) => o.id !== owner.id),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({
                owners: [
                  ...settings.owners,
                  { id: randomId(), name: "New Owner", email: "" },
                ],
              })
            }
          >
            <Plus className="size-3.5" /> Add Owner
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <StringListCard
          title="Event Styles"
          values={settings.eventStyles}
          onChange={(eventStyles) => onChange({ eventStyles })}
        />
        <StringListCard
          title="Event Types"
          values={settings.eventTypes}
          onChange={(eventTypes) => onChange({ eventTypes })}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
          <CardDescription>
            Default deposit applied to new contracts (% of Grand Total).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-40">
            <Input
              type="number"
              min={0}
              className="pr-7"
              value={settings.defaultDepositPercent || ""}
              onChange={(e) =>
                onChange({ defaultDepositPercent: Number(e.target.value) || 0 })
              }
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Terms &amp; Conditions</CardTitle>
          <CardDescription>
            Pre-filled into every new contract; editable per contract.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={10}
            value={settings.defaultTerms}
            onChange={(defaultTerms) => onChange({ defaultTerms })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function StringListCard({
  title,
  values,
  onChange,
}: {
  title: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {values.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              value={value}
              onChange={(e) =>
                onChange(values.map((v, j) => (j === i ? e.target.value : v)))
              }
            />
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...values, ""])}>
          <Plus className="size-3.5" /> Add
        </Button>
      </CardContent>
    </Card>
  );
}
