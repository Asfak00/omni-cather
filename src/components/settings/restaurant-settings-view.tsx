"use client";

import * as React from "react";
import { toast } from "sonner";
import { Cloud, CloudOff, Loader2, Save } from "lucide-react";
import type { RestaurantSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PicklistsManager } from "./picklists-manager";
import { CategoriesManager } from "./categories-manager";
import { BillingDetailsManager } from "./billing-details-manager";
import { DocumentsManager } from "./documents-manager";
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
  const [ghlSynced, setGhlSynced] = React.useState<boolean | null>(null);

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
      const data = await res.json();
      setGhlSynced(Boolean(data.ghlSynced));
      setDirty(false);
      toast.success(
        data.ghlSynced
          ? "Settings saved & synced to Omni Cather"
          : "Settings saved — Omni Cather sync activates once credentials are connected"
      );
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  // Auto-save (debounced) so nothing is lost while navigating tabs
  const skipFirst = React.useRef(true);
  React.useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    if (!dirty) return;
    const t = setTimeout(async () => {
      const res = await fetch("/api/settings/restaurant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json().catch(() => null);
        setGhlSynced(Boolean(data?.ghlSynced));
        setDirty(false);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [settings, dirty]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1>Restaurant Settings</h1>
          <p className="text-muted-foreground">
            Picklists, categories, billing details and documents used to build
            every contract.
            {ghlSynced !== null && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium">
                {ghlSynced ? (
                  <>
                    <Cloud className="size-3.5 text-primary" />
                    <span className="text-primary">Synced to Omni Cather</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Local only (connect Omni Cather to sync)
                    </span>
                  </>
                )}
              </span>
            )}
          </p>
        </div>
        <Button onClick={save} disabled={saving || !dirty}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {dirty ? "Save Changes" : "All Saved"}
        </Button>
      </div>

      <Tabs defaultValue="picklists">
        <TabsList className="flex-wrap">
          <TabsTrigger value="picklists">Picklists</TabsTrigger>
          <TabsTrigger value="categories">Menu Item Categories</TabsTrigger>
          <TabsTrigger value="billing">Billing Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="areas">Areas</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        <TabsContent value="picklists" className="mt-4">
          <PicklistsManager settings={settings} onChange={update} />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesManager settings={settings} onChange={update} />
        </TabsContent>
        <TabsContent value="billing" className="mt-4">
          <BillingDetailsManager settings={settings} onChange={update} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <DocumentsManager settings={settings} onChange={update} />
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
