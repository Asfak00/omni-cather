"use client";

import { Calendar, GripVertical, Trash2 } from "lucide-react";
import type { BillingSettings, Contract, ContractTotals } from "@/types";
import { currency } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  contract: Contract;
  totals: ContractTotals;
  onChange: (patch: Partial<Contract>) => void;
}

export function BillingWidget({ contract, totals, onChange }: Props) {
  const billing = contract.billing;
  const patchBilling = (patch: Partial<BillingSettings>) =>
    onChange({ billing: { ...billing, ...patch } });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Billing Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={3}
            placeholder="Notes visible on the invoice and contract..."
            value={contract.billingNotes}
            onChange={(e) => onChange({ billingNotes: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Billing Widget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-[24px_1fr_120px_140px_32px] items-center gap-x-3 gap-y-2 text-sm">
            {/* header */}
            <span />
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Description
            </span>
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Amount
            </span>
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Total
            </span>
            <span />

            <BillingRow label="Beverage" total={currency(totals.beverageTotal)} />
            <BillingRow label="Food" total={currency(totals.foodTotal)} />
            {totals.otherTotal > 0 && (
              <BillingRow label="Other Items" total={currency(totals.otherTotal)} />
            )}
            <BillingRow label="Subtotal" total={currency(totals.subtotal)} bold />

            <BillingRow
              label="Sales Tax"
              total={currency(totals.salesTax)}
              amount={
                <PercentInput
                  value={billing.salesTaxRate}
                  onChange={(v) => patchBilling({ salesTaxRate: v })}
                />
              }
              deletable
            />
            <BillingRow
              label="Gratuity"
              total={currency(totals.gratuity)}
              amount={
                <PercentInput
                  value={billing.gratuityRate}
                  onChange={(v) => patchBilling({ gratuityRate: v })}
                />
              }
              deletable
            />
            <BillingRow
              label="Admin Fee"
              total={currency(totals.adminFee)}
              amount={
                <PercentInput
                  value={billing.adminFeeRate}
                  onChange={(v) => patchBilling({ adminFeeRate: v })}
                />
              }
              deletable
            />

            <div className="col-span-5 my-1 border-t" />

            <BillingRow
              label="Room Rental"
              total={currency(totals.roomRental)}
              amount={
                <div>
                  <Input
                    type="number"
                    min={0}
                    className="h-8"
                    value={billing.roomRental || ""}
                    onChange={(e) =>
                      patchBilling({ roomRental: Number(e.target.value) || 0 })
                    }
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Room Rental
                  </p>
                </div>
              }
              deletable
            />
            <BillingRow
              label="F&B Minimum"
              total={currency(0)}
              amount={
                <div>
                  <Input
                    type="number"
                    min={0}
                    className="h-8"
                    value={billing.fbMinimum || ""}
                    onChange={(e) =>
                      patchBilling({ fbMinimum: Number(e.target.value) || 0 })
                    }
                  />
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {totals.fbMinimumMet
                      ? `${currency(billing.fbMinimum)} Met`
                      : `${currency(billing.fbMinimum)} Not Met`}
                  </p>
                </div>
              }
              deletable
            />

            <BillingRow
              label="Grand Total"
              total={currency(totals.grandTotal)}
              bold
            />

            <BillingRow
              label="Deposit"
              total={
                <span className="flex items-center justify-end gap-2">
                  {currency(totals.deposit)}
                  <button
                    type="button"
                    onClick={() => patchBilling({ depositPaid: !billing.depositPaid })}
                    title="Toggle paid status"
                  >
                    <Badge
                      className={cn(
                        "cursor-pointer",
                        billing.depositPaid ? "bg-emerald-600" : "bg-red-600"
                      )}
                    >
                      {billing.depositPaid ? "Paid" : "Not Paid"}
                    </Badge>
                  </button>
                </span>
              }
              amount={
                <div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <Input
                      type="date"
                      className="h-8"
                      value={billing.depositDueDate ?? ""}
                      onChange={(e) =>
                        patchBilling({ depositDueDate: e.target.value })
                      }
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Deposit Due Date
                  </p>
                  <PercentInput
                    value={billing.depositPercent}
                    onChange={(v) => patchBilling({ depositPercent: v })}
                    className="mt-1"
                  />
                </div>
              }
              deletable
            />

            <BillingRow
              label="Estimated Amount Due"
              total={currency(totals.estimatedAmountDue)}
              amount={
                <div>
                  <div className="flex items-center gap-1">
                    <Calendar className="size-3.5 text-muted-foreground" />
                    <Input
                      type="date"
                      className="h-8"
                      value={billing.balanceDueDate ?? ""}
                      onChange={(e) =>
                        patchBilling({ balanceDueDate: e.target.value })
                      }
                    />
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    Balance Due Date
                  </p>
                </div>
              }
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t pt-3">
            <Label htmlFor="transfer" className="text-sm font-medium">
              Transfer Financials to Event
            </Label>
            <Switch
              id="transfer"
              checked={billing.transferFinancialsToEvent}
              onCheckedChange={(v) =>
                patchBilling({ transferFinancialsToEvent: v })
              }
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function BillingRow({
  label,
  amount,
  total,
  bold,
  deletable,
}: {
  label: string;
  amount?: React.ReactNode;
  total: React.ReactNode;
  bold?: boolean;
  deletable?: boolean;
}) {
  return (
    <>
      <GripVertical className="size-4 text-muted-foreground/50" />
      <span className={cn(bold && "font-semibold")}>{label}</span>
      <span>{amount}</span>
      <span className={cn("text-right", bold && "font-semibold")}>{total}</span>
      <span>
        {deletable && (
          <Trash2 className="size-3.5 cursor-pointer text-destructive/60 hover:text-destructive" />
        )}
      </span>
    </>
  );
}

function PercentInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Input
        type="number"
        min={0}
        step="0.001"
        className="h-8 pr-7"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        %
      </span>
    </div>
  );
}
