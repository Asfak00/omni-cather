"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import type { RestaurantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManager } from "./menu-manager";
import { TaxManager } from "./tax-manager";
import { AreasManager } from "./areas-manager";
import { GeneralSettings } from "./general-settings";

export function RestaurantSettingsView({
  initialSettings,
}: {
  initialSettings: RestaurantSettings;
}) {
  const [settings, setSettings] = React.useState(initialSettings);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const update = (patch: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  };

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      toast.success("Restaurant settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Restaurant Settings</h1>
          <p className="text-muted-foreground">
            Menus, taxes and venue data used to build every contract.
          </p>
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="menus">
        <TabsList>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="taxes">Taxes &amp; Fees</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="menus" className="mt-4">
          <MenuManager
            menus={settings.menus}
            onChange={(menus) => update({ menus })}
          />
        </TabsContent>
        <TabsContent value="taxes" className="mt-4">
          <TaxManager settings={settings} onChange={update} />
        </TabsContent>
        <TabsContent value="areas" className="mt-4">
          <AreasManager settings={settings} onChange={update} />
        </TabsContent>
        <TabsContent value="general" className="mt-4">
          <GeneralSettings settings={settings} onChange={update} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
