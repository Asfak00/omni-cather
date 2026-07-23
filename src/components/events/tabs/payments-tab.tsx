"use client";

import * as React from "react";
import { format } from "date-fns";
import { Eye, FileText, Trash2 } from "lucide-react";
import type { Contract, ContractTotals, PaymentRecord } from "@/types";
import { currency } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function randomId() {
  return `pay_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const METHODS = ["Credit Card", "Cash", "Check", "Bank Transfer", "Other"];

interface Props {
  contract: Contract;
  totals: ContractTotals;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
}

export function PaymentsTab({ contract, totals, onPatch }: Props) {
  const [subTab, setSubTab] = React.useState<"payments" | "cards">("payments");
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState(METHODS[0]);
  const [date, setDate] = React.useState("");

  const payments = contract.payments ?? [];
  const uncovered = Math.max(
    0,
    totals.remaining -
      payments.filter((p) => p.status === "new").reduce((s, p) => s + p.amount, 0)
  );

  function openAdd(prefill?: number) {
    setAmount(prefill ? String(prefill) : "");
    setOpen(true);
  }

  async function addPayment() {
    const payment: PaymentRecord = {
      id: randomId(),
      label: "Payment",
      amount: Number(amount) || 0,
      method,
      date: date || undefined,
      status: "paid",
    };
    await onPatch({ payments: [...payments, payment] });
    setOpen(false);
    setDate("");
  }

  async function removePayment(id: string) {
    await onPatch({ payments: payments.filter((p) => p.id !== id) });
  }

  async function togglePaid(p: PaymentRecord) {
    await onPatch({
      payments: payments.map((x) =>
        x.id === p.id ? { ...x, status: x.status === "paid" ? "new" : "paid" } : x
      ),
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* sub tabs */}
        <div className="mb-4 flex rounded-lg border p-1 w-fit">
          {(
            [
              { key: "payments", label: "Payments" },
              { key: "cards", label: "Credit Cards", count: 0 },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSubTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-medium",
                subTab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {"count" in t && (
                <Badge variant="secondary" className="size-5 justify-center rounded-full p-0">
                  {t.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {subTab === "cards" ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No credit cards on file. Cards are collected via the GHL payment
            forms linked from the Invoice document.
          </p>
        ) : (
          <div className="rounded-md border">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-semibold">
                Contract &amp; Event Order: {contract.orderNumber} —{" "}
                {currency(totals.grandTotal)}
              </span>
              <Eye className="size-4 text-muted-foreground" />
            </div>

            <div className="px-4 py-2">
              <div className="grid grid-cols-[1.5fr_100px_90px_90px_90px_110px_100px_40px] items-center gap-2 border-b py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                <span />
                <span className="text-right">Amount</span>
                <span>Due</span>
                <span>Paid</span>
                <span>Status</span>
                <span>Method</span>
                <span>Id</span>
                <span />
              </div>

              {/* Grand total */}
              <div className="grid grid-cols-[1.5fr_100px_90px_90px_90px_110px_100px_40px] items-center gap-2 border-b py-2.5 text-sm">
                <span className="font-bold">Grand Total</span>
                <span className="text-right font-bold">
                  {currency(totals.grandTotal)}
                </span>
                <span /><span /><span /><span /><span /><span />
              </div>

              {/* Deposit */}
              <div className="grid grid-cols-[1.5fr_100px_90px_90px_90px_110px_100px_40px] items-center gap-2 border-b py-2.5 text-sm">
                <span>Deposit amount</span>
                <span className="text-right">{currency(totals.deposit)}</span>
                <span className="text-xs text-muted-foreground">
                  {contract.billing.depositDueDate
                    ? format(
                        new Date(`${contract.billing.depositDueDate}T00:00:00`),
                        "M/d/yy"
                      )
                    : ""}
                </span>
                <span />
                <span>
                  <Badge
                    className={cn(
                      "cursor-pointer",
                      contract.billing.depositPaid
                        ? "bg-emerald-600"
                        : "bg-amber-500"
                    )}
                    onClick={() =>
                      onPatch({
                        billing: {
                          ...contract.billing,
                          depositPaid: !contract.billing.depositPaid,
                        },
                      })
                    }
                  >
                    {contract.billing.depositPaid ? "Paid" : "New"}
                  </Badge>
                </span>
                <span />
                <span className="text-xs text-muted-foreground">
                  {contract.eventId}
                </span>
                <span />
              </div>

              {/* user payments */}
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-[1.5fr_100px_90px_90px_90px_110px_100px_40px] items-center gap-2 border-b py-2.5 text-sm"
                >
                  <span>{p.label}</span>
                  <span className="text-right">{currency(p.amount)}</span>
                  <span />
                  <span className="text-xs text-muted-foreground">
                    {p.date
                      ? format(new Date(`${p.date}T00:00:00`), "M/d/yy")
                      : ""}
                  </span>
                  <span>
                    <Badge
                      className={cn(
                        "cursor-pointer",
                        p.status === "paid" ? "bg-emerald-600" : "bg-amber-500"
                      )}
                      onClick={() => togglePaid(p)}
                    >
                      {p.status === "paid" ? "Paid" : "New"}
                    </Badge>
                  </span>
                  <span className="text-xs">{p.method}</span>
                  <span className="text-xs text-muted-foreground">
                    {p.id.slice(-8)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => removePayment(p.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}

              {/* outstanding */}
              <div className="grid grid-cols-[1.5fr_100px] items-center gap-2 py-2.5 text-sm">
                <span className="italic font-semibold">Total Outstanding</span>
                <span className="text-right font-semibold">
                  {currency(totals.remaining)}
                </span>
              </div>
            </div>

            {uncovered > 0 && (
              <div className="mx-4 mb-3 flex flex-wrap items-center gap-3 rounded-md bg-muted/50 px-4 py-3 text-sm">
                <span>
                  <strong>{currency(uncovered)}</strong> is not being covered by
                  any payments.
                </span>
                <Button size="sm" onClick={() => openAdd(uncovered)}>
                  Add Payment for {currency(uncovered)}
                </Button>
              </div>
            )}

            <div className="px-4 pb-4">
              <Button size="sm" variant="secondary" onClick={() => openAdd()}>
                Add a Payment
              </Button>
            </div>
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add a Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Method</Label>
                <Select value={method} onValueChange={(v) => v && setMethod(v)}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment date</Label>
                <div className="mt-1">
                  <DatePicker value={date} onChange={setDate} clearable />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addPayment} disabled={!Number(amount)}>
                Add Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
