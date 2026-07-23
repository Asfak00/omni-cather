"use client";

import * as React from "react";
import { toast } from "sonner";
import { FileText, HelpCircle, Plus } from "lucide-react";
import type { DocLayoutSetting, RestaurantSettings } from "@/types";
import { DOC_META } from "@/lib/docs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function DocumentsManager({ settings, onChange }: Props) {
  const [editing, setEditing] = React.useState<DocLayoutSetting | null>(null);
  const layouts = settings.docLayouts;

  const patchLayout = (name: string, patch: Partial<DocLayoutSetting>) =>
    onChange({
      docLayouts: layouts.map((l) => (l.name === name ? { ...l, ...patch } : l)),
    });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Events</h3>
          <Button
            size="sm"
            onClick={() =>
              toast.info(
                "Document templates are generated from the contract data — layouts are configured below"
              )
            }
          >
            <Plus className="size-4" /> New Template
          </Button>
        </div>

        <div className="rounded-md border">
          {/* template header */}
          <div className="flex flex-wrap items-center gap-4 border-b px-4 py-3">
            <span className="font-semibold">Contract &amp; Event Order</span>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={settings.docQrEnabled ?? false}
                onCheckedChange={(v) => onChange({ docQrEnabled: v === true })}
              />
              Enable QR Code
              <HelpCircle className="size-3.5 text-muted-foreground" />
            </label>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="uppercase"
                onClick={() =>
                  toast.info(
                    "Template content (terms, contact info block) is edited per-contract or in General settings"
                  )
                }
              >
                Edit Template Content
              </Button>
            </div>
          </div>

          {/* layouts */}
          {layouts.map((layout, i) => (
            <div
              key={layout.name}
              className={cn(
                "flex items-center gap-3 border-b px-4 py-3 last:border-b-0",
                i % 2 === 0 && "bg-muted/20",
                !layout.enabled && "opacity-50"
              )}
            >
              <FileText className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">{layout.name}</span>
              {layout.internal && (
                <Badge className="bg-teal-100 text-[10px] text-teal-800">
                  Internal
                </Badge>
              )}
              {!layout.enabled && (
                <Badge variant="outline" className="text-[10px]">
                  disabled
                </Badge>
              )}
              <span className="ml-2 hidden text-xs text-muted-foreground sm:block">
                {DOC_META[layout.name].description}
              </span>
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="uppercase"
                  onClick={() => setEditing(layout)}
                >
                  Edit Layout
                </Button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-primary"
            onClick={() =>
              toast.info(
                "The six standard layouts cover the full event flow — disable the ones you don't need"
              )
            }
          >
            <Plus className="size-4" /> Add Layout
          </button>
        </div>

        {/* layout editor dialog */}
        <Dialog open={editing !== null} onOpenChange={(v) => !v && setEditing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Layout — {editing?.name}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {DOC_META[editing.name].description}. Prepared for:{" "}
                  <Badge variant="secondary" className="uppercase">
                    {DOC_META[editing.name].audience}
                  </Badge>
                </p>
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <Label htmlFor="layout-enabled" className="text-sm">
                    Generate this document for new events
                  </Label>
                  <Switch
                    id="layout-enabled"
                    checked={editing.enabled}
                    onCheckedChange={(v) => {
                      patchLayout(editing.name, { enabled: v });
                      setEditing({ ...editing, enabled: v });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border px-4 py-3">
                  <div>
                    <Label htmlFor="layout-internal" className="text-sm">
                      Internal only
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Internal documents are never shared with guests
                    </p>
                  </div>
                  <Switch
                    id="layout-internal"
                    checked={editing.internal ?? false}
                    onCheckedChange={(v) => {
                      patchLayout(editing.name, { internal: v });
                      setEditing({ ...editing, internal: v });
                    }}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setEditing(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
