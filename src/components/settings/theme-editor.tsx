"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, RotateCcw, Save } from "lucide-react";
import type { ThemeSettings } from "@/types";
import { useThemeSettings } from "@/components/theme/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FONT_OPTIONS = [
  { label: "Geist (default)", value: "Geist, ui-sans-serif, system-ui, sans-serif" },
  { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "System UI", value: "ui-sans-serif, system-ui, sans-serif" },
  { label: "Georgia (serif)", value: "Georgia, 'Times New Roman', serif" },
  { label: "Playfair-style serif", value: "'Playfair Display', Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, 'SF Mono', Menlo, monospace" },
];

export function ThemeEditor() {
  const { theme, setTheme, saveTheme, resetTheme } = useThemeSettings();
  const [saving, setSaving] = React.useState(false);

  const update = (patch: Partial<ThemeSettings>) =>
    setTheme({ ...theme, ...patch });

  async function save() {
    setSaving(true);
    try {
      await saveTheme(theme);
      toast.success("Theme saved — applied across the app");
    } catch {
      toast.error("Failed to save theme");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    try {
      await resetTheme();
      toast.success("Theme reset to defaults");
    } catch {
      toast.error("Failed to reset theme");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1>Theme &amp; Appearance</h1>
          <p className="text-muted-foreground">
            Changes preview live everywhere. Save to persist for all users.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={reset} disabled={saving}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Brand colors used across the app.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary"
                value={theme.primaryColor}
                onChange={(v) => update({ primaryColor: v })}
              />
              <ColorField
                label="Accent"
                value={theme.accentColor}
                onChange={(v) => update({ accentColor: v })}
              />
              <ColorField
                label="Background"
                value={theme.backgroundColor}
                onChange={(v) => update({ backgroundColor: v })}
              />
              <ColorField
                label="Text"
                value={theme.foregroundColor}
                onChange={(v) => update({ foregroundColor: v })}
              />
              <ColorField
                label="Card / Surface"
                value={theme.cardColor}
                onChange={(v) => update({ cardColor: v })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fonts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Body font</Label>
                <Select
                  value={theme.bodyFont}
                  onValueChange={(v) => v && update({ bodyFont: v })}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Heading font</Label>
                <Select
                  value={theme.headingFont}
                  onValueChange={(v) => v && update({ headingFont: v })}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Heading weight</Label>
                <Select
                  value={String(theme.headingWeight)}
                  onValueChange={(v) => update({ headingWeight: Number(v) })}
                >
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[500, 600, 700, 800].map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography Sizes</CardTitle>
              <CardDescription>Pixel sizes for headings and text.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <SizeField label="Heading 1" value={theme.h1Size} min={20} max={56} onChange={(v) => update({ h1Size: v })} />
              <SizeField label="Heading 2" value={theme.h2Size} min={16} max={44} onChange={(v) => update({ h2Size: v })} />
              <SizeField label="Heading 3" value={theme.h3Size} min={14} max={36} onChange={(v) => update({ h3Size: v })} />
              <SizeField label="Heading 4" value={theme.h4Size} min={12} max={28} onChange={(v) => update({ h4Size: v })} />
              <SizeField label="Paragraph" value={theme.paragraphSize} min={11} max={22} onChange={(v) => update({ paragraphSize: v })} />
              <SizeField label="Small text" value={theme.smallSize} min={9} max={16} onChange={(v) => update({ smallSize: v })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shape</CardTitle>
            </CardHeader>
            <CardContent>
              <SizeField
                label={`Corner radius (${theme.radius}rem)`}
                value={theme.radius}
                min={0}
                max={1.5}
                step={0.125}
                onChange={(v) => update({ radius: v })}
              />
            </CardContent>
          </Card>
        </div>

        {/* live preview */}
        <Card className="h-fit lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-lg border bg-background p-4">
              <h1>Heading One</h1>
              <h2>Heading Two</h2>
              <h3>Heading Three</h3>
              <h4>Heading Four</h4>
              <p>
                This paragraph previews your body font and size. The quick brown
                fox jumps over the lazy dog.
              </p>
              <small className="text-muted-foreground">
                Small helper text looks like this.
              </small>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm">Primary Button</Button>
                <Button size="sm" variant="secondary">
                  Secondary
                </Button>
                <Button size="sm" variant="outline">
                  Outline
                </Button>
              </div>
              <div className="flex gap-2 pt-1">
                <Badge>Badge</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          className="size-9 cursor-pointer rounded-md border bg-transparent p-0.5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <Input
          className="w-32 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function SizeField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {step >= 1 ? `${value}px` : value}
        </span>
      </div>
      <input
        type="range"
        className="mt-2 w-full accent-[var(--primary)]"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
