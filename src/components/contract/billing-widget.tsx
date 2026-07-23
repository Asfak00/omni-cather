"use client";

import * as React from "react";
import {
  ChevronDown,
  GripVertical,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  ApplicableCharge,
  BillingSettings,
  ChargeSettings,
  Contract,
  ContractTotals,
  CustomCharge,
} from "@/types";
import { currency } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

const CHARGES: ApplicableCharge[] = ["Sales Tax", "Gratuity", "Admin Fee"];

const RATE_KEYS: Record<ApplicableCharge, keyof BillingSettings> = {
  "Sales Tax": "salesTaxRate",
  Gratuity: "gratuityRate",
  "Admin Fee": "adminFeeRate",
};

function randomId() {
  return `chg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  contract: Contract;
  totals: ContractTotals;
  onChange: (patch: Partial<Contract>) => void;
}

export function BillingWidget({ contract, totals, onChange }: Props) {
  const billing = contract.billing;
  const [openSettings, setOpenSettings] = React.useState<ApplicableCharge | null>(
    null
  );
  const [dragKey, setDragKey] = React.useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = React.useState<string | null>(null);

  const patchBilling = (patch: Partial<BillingSettings>) =>
    onChange({ billing: { ...billing, ...patch } });

  /** ordered charge-row keys: builtin names + custom charge ids */
  const chargeRowKeys = React.useMemo(() => {
    const known = new Set<string>([
      ...CHARGES,
      ...(billing.customCharges ?? []).map((c) => c.id),
    ]);
    const saved = (billing.chargeOrder ?? []).filter((k) => known.has(k));
    for (const k of known) if (!saved.includes(k)) saved.push(k);
    return saved;
  }, [billing.chargeOrder, billing.customCharges]);

  const reorderCharges = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    const order = [...chargeRowKeys];
    const from = order.indexOf(dragKey);
    const to = order.indexOf(targetKey);
    if (from === -1 || to === -1) return;
    order.splice(from, 1);
    order.splice(to, 0, dragKey);
    patchBilling({ chargeOrder: order });
  };

  const settingsFor = (charge: ApplicableCharge): ChargeSettings =>
    billing.chargeSettings?.[charge] ?? {
      includeFrom: [],
      excludeFromTotals: false,
    };

  const patchChargeSettings = (
    charge: ApplicableCharge,
    patch: Partial<ChargeSettings>
  ) =>
    patchBilling({
      chargeSettings: {
        ...billing.chargeSettings,
        [charge]: { ...settingsFor(charge), ...patch },
      },
    });

  const chargeTotal = (charge: ApplicableCharge) =>
    charge === "Sales Tax"
      ? totals.salesTax
      : charge === "Gratuity"
        ? totals.gratuity
        : totals.adminFee;

  const addCustomCharge = (mode: "percent" | "amount") => {
    const custom: CustomCharge = {
      id: randomId(),
      label: mode === "percent" ? "New Fee" : "New Charge",
      mode,
      value: 0,
    };
    patchBilling({ customCharges: [...(billing.customCharges ?? []), custom] });
  };

  const patchCustom = (id: string, patch: Partial<CustomCharge>) =>
    patchBilling({
      customCharges: (billing.customCharges ?? []).map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Billing Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            rows={3}
            placeholder="Notes visible on the invoice and contract..."
            value={contract.billingNotes}
            onChange={(v) => onChange({ billingNotes: v })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Billing Widget</CardTitle>
        </CardHeader>
        <CardContent>
          {/* header */}
          <div className="grid grid-cols-[24px_1fr_150px_150px_70px] items-center gap-x-3 border-b pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span />
            <span>Description</span>
            <span>Amount</span>
            <span>Total</span>
            <span />
          </div>

          <div className="divide-y">
            {/* category breakdown from line items */}
            {totals.categoryTotals.map((cat) => (
              <Row key={cat.category}>
                <Grip />
                <span className="text-sm">{cat.category}</span>
                <span />
                <span className="text-sm">{currency(cat.total)}</span>
                <span />
              </Row>
            ))}

            {/* subtotal */}
            <Row>
              <Grip />
              <span className="text-sm font-semibold">Subtotal</span>
              <span />
              <span className="text-sm font-semibold">
                {currency(totals.subtotal)}
              </span>
              <span />
            </Row>

            {/* charge rows — drag the grip to reorder */}
            {chargeRowKeys.map((key) => {
              const isBuiltin = (CHARGES as string[]).includes(key);
              const custom = (billing.customCharges ?? []).find(
                (c) => c.id === key
              );
              if (!isBuiltin && !custom) return null;

              const dragProps = {
                isDragging: dragKey === key,
                isOver: dragOverKey === key && dragKey !== key,
                onDragStart: () => setDragKey(key),
                onDragEnd: () => {
                  setDragKey(null);
                  setDragOverKey(null);
                },
                onDragOver: (e: React.DragEvent) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverKey(key);
                },
                onDrop: () => {
                  reorderCharges(key);
                  setDragKey(null);
                  setDragOverKey(null);
                },
              };

              if (isBuiltin) {
                const charge = key as ApplicableCharge;
                const cs = settingsFor(charge);
                const rate = billing[RATE_KEYS[charge]] as number;
                const isOpen = openSettings === charge;
                return (
                  <DraggableRow key={key} {...dragProps}>
                    {(grip) => (
                      <>
                        <Row>
                          {grip}
                          <span className="text-sm">{charge}</span>
                          <PercentInput
                            value={rate}
                            onChange={(v) =>
                              patchBilling({ [RATE_KEYS[charge]]: v } as Partial<BillingSettings>)
                            }
                          />
                          <span
                            className={cn(
                              "text-sm",
                              cs.excludeFromTotals &&
                                "text-muted-foreground line-through"
                            )}
                          >
                            {currency(chargeTotal(charge))}
                          </span>
                          <span className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              onClick={() =>
                                setOpenSettings(isOpen ? null : charge)
                              }
                              title="Charge settings"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              className="text-destructive"
                              title="Remove (set to 0%)"
                              onClick={() =>
                                patchBilling({ [RATE_KEYS[charge]]: 0 } as Partial<BillingSettings>)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </span>
                        </Row>

                        {isOpen && (
                          <div className="bg-muted/40 px-8 py-4">
                            <div className="grid gap-6 sm:grid-cols-2">
                              <div>
                                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                                  Apply to billing detail
                                </Label>
                                <Select value={charge} onValueChange={() => {}}>
                                  <SelectTrigger className="mt-1.5 w-44">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CHARGES.map((c) => (
                                      <SelectItem key={c} value={c}>
                                        {c}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <label className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                                  <Checkbox
                                    checked={cs.excludeFromTotals}
                                    onCheckedChange={(v) =>
                                      patchChargeSettings(charge, {
                                        excludeFromTotals: v === true,
                                      })
                                    }
                                  />
                                  Exclude from totals
                                </label>
                              </div>
                              <div>
                                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                                  Include totals from
                                </Label>
                                <div className="mt-1.5 space-y-1.5">
                                  {CHARGES.filter((c) => c !== charge).map(
                                    (other) => (
                                      <label
                                        key={other}
                                        className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"
                                      >
                                        <Checkbox
                                          checked={cs.includeFrom.includes(other)}
                                          onCheckedChange={(v) =>
                                            patchChargeSettings(charge, {
                                              includeFrom:
                                                v === true
                                                  ? [...cs.includeFrom, other]
                                                  : cs.includeFrom.filter(
                                                      (x) => x !== other
                                                    ),
                                            })
                                          }
                                        />
                                        {other}
                                      </label>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </DraggableRow>
                );
              }

              const total =
                totals.customChargeTotals.find((c) => c.id === custom!.id)
                  ?.total ?? 0;
              return (
                <DraggableRow key={key} {...dragProps}>
                  {(grip) => (
                    <Row>
                      {grip}
                      <Input
                        className="h-9 max-w-md"
                        value={custom!.label}
                        onChange={(e) =>
                          patchCustom(custom!.id, { label: e.target.value })
                        }
                      />
                      <span className="relative">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          className="h-9 pr-7"
                          value={custom!.value || ""}
                          onChange={(e) =>
                            patchCustom(custom!.id, {
                              value: Number(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          {custom!.mode === "percent" ? "%" : "$"}
                        </span>
                      </span>
                      <span className="text-sm">{currency(total)}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-destructive"
                        onClick={() =>
                          patchBilling({
                            customCharges: (billing.customCharges ?? []).filter(
                              (c) => c.id !== custom!.id
                            ),
                          })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </Row>
                  )}
                </DraggableRow>
              );
            })}

            {/* add a row */}
            <div className="py-2.5 pl-9">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button type="button" variant="outline" size="sm" />}
                >
                  Add a Row <ChevronDown className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => addCustomCharge("percent")}>
                    <Plus className="size-4" /> Percentage fee (% of subtotal)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addCustomCharge("amount")}>
                    <Plus className="size-4" /> Flat amount charge
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* room rental */}
            <Row>
              <Grip />
              <span className="text-sm">Room Rental</span>
              <span>
                <Input
                  type="number"
                  min={0}
                  className="h-9"
                  value={billing.roomRental || ""}
                  onChange={(e) =>
                    patchBilling({ roomRental: Number(e.target.value) || 0 })
                  }
                />
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  Room Rental
                </span>
              </span>
              <span className="text-sm">{currency(totals.roomRental)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive"
                onClick={() => patchBilling({ roomRental: 0 })}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </Row>

            {/* F&B minimum */}
            <Row>
              <Grip />
              <span className="text-sm">F&amp;B Minimum</span>
              <span>
                <Input
                  type="number"
                  min={0}
                  className="h-9"
                  value={billing.fbMinimum || ""}
                  onChange={(e) =>
                    patchBilling({ fbMinimum: Number(e.target.value) || 0 })
                  }
                />
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  F&amp;B Min ·{" "}
                  {totals.fbMinimumMet
                    ? `${currency(billing.fbMinimum || 0)} Met`
                    : `${currency(billing.fbMinimum || 0)} Not Met`}
                </span>
              </span>
              <span className="text-sm">{currency(0)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-destructive"
                onClick={() => patchBilling({ fbMinimum: 0 })}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </Row>

            {/* grand total */}
            <Row>
              <Grip />
              <span className="text-sm font-semibold">Grand Total</span>
              <span />
              <span className="text-sm font-semibold">
                {currency(totals.grandTotal)}
              </span>
              <span />
            </Row>

            {/* deposit */}
            <Row className="items-start">
              <Grip />
              <span className="pt-2 text-sm">Deposit</span>
              <span className="space-y-1">
                <DatePicker
                  value={billing.depositDueDate}
                  onChange={(depositDueDate) => patchBilling({ depositDueDate })}
                  placeholder="Due date"
                  clearable
                />
                <span className="block text-[10px] text-muted-foreground">
                  Deposit Due Date
                </span>
                <span className="relative block">
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="h-9 pr-8"
                    value={billing.depositPercent || ""}
                    onChange={(e) =>
                      patchBilling({
                        depositPercent: Number(e.target.value) || 0,
                      })
                    }
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {(billing.depositMode ?? "percent") === "percent" ? "%" : "$"}
                  </span>
                </span>
              </span>
              <span className="flex items-center gap-2 pt-2 text-sm">
                {currency(totals.deposit)}
                <button
                  type="button"
                  onClick={() =>
                    patchBilling({ depositPaid: !billing.depositPaid })
                  }
                  title="Toggle paid status"
                >
                  <Badge
                    className={cn(
                      billing.depositPaid ? "bg-emerald-600" : "bg-red-600"
                    )}
                  >
                    {billing.depositPaid ? "Paid" : "Not Paid"}
                  </Badge>
                </button>
              </span>
              <span />
            </Row>

            {/* estimated amount due */}
            <Row className="items-start">
              <Grip />
              <span className="pt-2 text-sm">Estimated Amount Due</span>
              <span className="space-y-1">
                <DatePicker
                  value={billing.balanceDueDate}
                  onChange={(balanceDueDate) => patchBilling({ balanceDueDate })}
                  placeholder="Due date"
                  clearable
                />
                <span className="block text-[10px] text-muted-foreground">
                  Balance Due Date
                </span>
              </span>
              <span className="pt-2 text-sm">
                {currency(totals.estimatedAmountDue)}
              </span>
              <span />
            </Row>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3">
            <Select
              value=""
              onValueChange={(v) => {
                if (v === "percent" || v === "amount") {
                  addCustomCharge(v);
                }
              }}
            >
              <SelectTrigger className="w-44 text-muted-foreground">
                <SelectValue placeholder="--- Add a field ---" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percentage fee row</SelectItem>
                <SelectItem value="amount">Flat charge row</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
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
          </div>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------------- pieces ---------------- */

function Row({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[24px_1fr_150px_150px_70px] items-center gap-x-3 py-2.5",
        className
      )}
    >
      {children}
    </div>
  );
}

function Grip() {
  return <GripVertical className="size-4 text-muted-foreground/50" />;
}

/** Row wrapper whose grip handle enables HTML5 drag & drop reordering */
function DraggableRow({
  isDragging,
  isOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  children,
}: {
  isDragging: boolean;
  isOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  children: (grip: React.ReactNode) => React.ReactNode;
}) {
  const [armed, setArmed] = React.useState(false);
  const grip = (
    <button
      type="button"
      title="Drag to reorder"
      className="cursor-grab text-muted-foreground/50 active:cursor-grabbing"
      onMouseDown={() => setArmed(true)}
      onMouseUp={() => setArmed(false)}
    >
      <GripVertical className="size-4" />
    </button>
  );
  return (
    <div
      draggable={armed}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={() => {
        setArmed(false);
        onDragEnd();
      }}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={cn(
        "transition-opacity",
        isDragging && "opacity-40",
        isOver && "rounded-md ring-2 ring-primary/30"
      )}
    >
      {children(grip)}
    </div>
  );
}

function PercentInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <span className="relative">
      <Input
        type="number"
        min={0}
        step="0.001"
        className="h-9 pr-7"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
        %
      </span>
    </span>
  );
}
