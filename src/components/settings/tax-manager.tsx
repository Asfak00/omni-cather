"use client";

import type { RestaurantSettings } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function TaxManager({ settings, onChange }: Props) {
  const patchTaxes = (patch: Partial<RestaurantSettings["taxes"]>) =>
    onChange({ taxes: { ...settings.taxes, ...patch } });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Taxes &amp; Fees</CardTitle>
          <CardDescription>
            Default rates applied to new contracts. Each line item can opt in or
            out of every charge individually.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <RateField
            label="Sales Tax"
            value={settings.taxes.salesTaxRate}
            onChange={(v) => patchTaxes({ salesTaxRate: v })}
          />
          <RateField
            label="Gratuity"
            value={settings.taxes.gratuityRate}
            onChange={(v) => patchTaxes({ gratuityRate: v })}
          />
          <RateField
            label="Admin Fee"
            value={settings.taxes.adminFeeRate}
            onChange={(v) => patchTaxes({ adminFeeRate: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <RateField
            label="Default Deposit (% of Grand Total)"
            value={settings.defaultDepositPercent}
            onChange={(v) => onChange({ defaultDepositPercent: v })}
          />
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
          <Textarea
            rows={12}
            className="font-mono text-xs leading-relaxed"
            value={settings.defaultTerms}
            onChange={(e) => onChange({ defaultTerms: e.target.value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function RateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="relative mt-1 max-w-40">
        <Input
          type="number"
          min={0}
          step="0.001"
          className="pr-7"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          %
        </span>
      </div>
    </div>
  );
}
