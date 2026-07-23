"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Forward,
  Pencil,
  Settings,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const GRID =
  "grid grid-cols-[1.4fr_110px_90px_90px_90px_110px_100px_44px] items-center gap-2";

interface Props {
  contract: Contract;
  totals: ContractTotals;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
  ghlInvoicesUrl?: string;
}

export function PaymentsTab({ contract, totals, onPatch, ghlInvoicesUrl }: Props) {
  const [subTab, setSubTab] = React.useState<"payments" | "cards">("payments");
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [editing, setEditing] = React.useState<PaymentRecord | null>(null);
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [method, setMethod] = React.useState(METHODS[0]);
  const [date, setDate] = React.useState("");

  const allPayments = contract.payments ?? [];
  const payments = allPayments.filter((p) => !p.deleted);
  const deletedPayments = allPayments.filter((p) => p.deleted);
  const uncovered = Math.max(
    0,
    totals.remaining -
      payments.filter((p) => p.status === "new").reduce((s, p) => s + p.amount, 0)
  );

  function openAdd(prefill?: number) {
    setEditing(null);
    setAmount(prefill ? String(prefill) : "");
    setMethod(METHODS[0]);
    setDate("");
    setOpen(true);
  }

  function openEdit(p: PaymentRecord) {
    setEditing(p);
    setAmount(String(p.amount));
    setMethod(p.method ?? METHODS[0]);
    setDate(p.date ?? "");
    setOpen(true);
  }

  async function submitPayment() {
    if (editing) {
      await onPatch({
        payments: allPayments.map((p) =>
          p.id === editing.id
            ? { ...p, amount: Number(amount) || 0, method, date: date || undefined }
            : p
        ),
      });
      toast.success("Payment updated");
    } else {
      const payment: PaymentRecord = {
        id: randomId(),
        label: "Payment",
        amount: Number(amount) || 0,
        method,
        date: date || undefined,
        status: "paid",
      };
      await onPatch({ payments: [...allPayments, payment] });
      toast.success("Payment recorded");
    }
    setOpen(false);
  }

  const setPayment = (id: string, patch: Partial<PaymentRecord>) =>
    onPatch({
      payments: allPayments.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });

  function requestPayment() {
    toast.info("Opening OmniCather payment request (invoice) page...");
    if (ghlInvoicesUrl) window.open(ghlInvoicesUrl, "_blank", "noopener");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* sub tabs */}
        <div className="mb-4 flex w-fit rounded-lg border p-1">
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
                <Badge
                  variant="secondary"
                  className="size-5 justify-center rounded-full p-0"
                >
                  {t.count}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {subTab === "cards" ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <CreditCard className="mx-auto mb-2 size-6" />
            No credit cards on file. Cards are collected through the OmniCather
            payment forms linked from the Invoice document.
          </div>
        ) : (
          <div className="rounded-md border">
            {/* order header */}
            <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-3">
              <FileText className="size-4 text-muted-foreground" />
              <span className="font-semibold">
                Contract &amp; Event Order: {contract.orderNumber} —{" "}
                {currency(totals.grandTotal)}
              </span>
              {contract.portalHidden ? (
                <EyeOff className="size-4 text-muted-foreground" />
              ) : (
                <Eye className="size-4 text-muted-foreground" />
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm" className="ml-auto" />
                  }
                >
                  <Settings className="size-3.5" />
                  <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      onPatch({ portalHidden: !contract.portalHidden });
                      toast.success(
                        contract.portalHidden
                          ? "Financials visible on Guest Portal"
                          : "Financials hidden from Guest Portal"
                      );
                    }}
                  >
                    {contract.portalHidden ? (
                      <>
                        <Eye className="size-4" /> Show on Guest Portal
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-4" /> Hide from Guest Portal
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="overflow-x-auto px-4 py-2">
              <div
                className={cn(
                  GRID,
                  "border-b py-2 text-[11px] font-semibold uppercase text-muted-foreground"
                )}
              >
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
              <div className={cn(GRID, "border-b py-2.5 text-sm")}>
                <span className="font-bold">Grand Total</span>
                <span className="text-right font-bold">
                  {currency(totals.grandTotal)}
                </span>
                <span /><span /><span /><span /><span /><span />
              </div>

              {/* Deposit row */}
              <div className={cn(GRID, "border-b py-2.5 text-sm")}>
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
                      contract.billing.depositPaid
                        ? "bg-(--success) text-white"
                        : "bg-(--warning) text-white"
                    )}
                  >
                    {contract.billing.depositPaid ? "Paid" : "New"}
                  </Badge>
                </span>
                <span />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {contract.eventId} <Eye className="size-3.5" />
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="outline" size="icon-xs" />}
                  >
                    <Settings className="size-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={requestPayment}>
                      <Forward className="size-4" /> Request Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onPatch({
                          billing: {
                            ...contract.billing,
                            depositPaid: !contract.billing.depositPaid,
                          },
                        })
                      }
                    >
                      <CreditCard className="size-4" />{" "}
                      {contract.billing.depositPaid ? "Mark Unpaid" : "Pay"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        toast.info(
                          "Edit the deposit in the Contract's Billing Widget"
                        )
                      }
                    >
                      <Pencil className="size-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() =>
                        onPatch({
                          billing: { ...contract.billing, depositPercent: 0 },
                        })
                      }
                    >
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* payment rows */}
              {[...payments, ...(showDeleted ? deletedPayments : [])].map((p) => (
                <div
                  key={p.id}
                  className={cn(
                    GRID,
                    "border-b py-2.5 text-sm",
                    p.deleted && "opacity-50"
                  )}
                >
                  <span>
                    {p.label}
                    {p.deleted && (
                      <Badge variant="outline" className="ml-2 text-[9px]">
                        deleted
                      </Badge>
                    )}
                  </span>
                  <span className="text-right">{currency(p.amount)}</span>
                  <span />
                  <span className="text-xs text-muted-foreground">
                    {p.date ? format(new Date(`${p.date}T00:00:00`), "M/d/yy") : ""}
                  </span>
                  <span>
                    <Badge
                      className={cn(
                        p.status === "paid" ? "bg-(--success) text-white" : "bg-(--warning) text-white"
                      )}
                    >
                      {p.status === "paid" ? "Paid" : "New"}
                    </Badge>
                  </span>
                  <span className="text-xs">{p.method}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {p.id.slice(-8)} <Eye className="size-3.5" />
                  </span>
                  {!p.deleted ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="outline" size="icon-xs" />}
                      >
                        <Settings className="size-3" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={requestPayment}>
                          <Forward className="size-4" /> Request Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setPayment(p.id, {
                              status: p.status === "paid" ? "new" : "paid",
                            })
                          }
                        >
                          <CreditCard className="size-4" />{" "}
                          {p.status === "paid" ? "Mark Unpaid" : "Pay"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(p)}>
                          <Pencil className="size-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setPayment(p.id, { deleted: true })}
                        >
                          <Trash2 className="size-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      variant="outline"
                      size="icon-xs"
                      title="Restore payment"
                      onClick={() => setPayment(p.id, { deleted: false })}
                    >
                      <Forward className="size-3 rotate-180" />
                    </Button>
                  )}
                </div>
              ))}

              {/* outstanding */}
              <div className="grid grid-cols-[1.4fr_110px] items-center gap-2 py-2.5 text-sm">
                <span className="font-semibold italic">Total Outstanding</span>
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

            <div className="flex items-center justify-between px-4 pb-4">
              <Button size="sm" variant="secondary" onClick={() => openAdd()}>
                Add a Payment
              </Button>
              <div className="text-right text-xs text-muted-foreground">
                {deletedPayments.length > 0 && (
                  <button
                    type="button"
                    className="block text-primary hover:underline"
                    onClick={() => setShowDeleted((v) => !v)}
                  >
                    {showDeleted ? "Hide" : "Show"} deleted payments
                  </button>
                )}
                <span className="flex items-center gap-1">
                  <Eye className="size-3" /> Indicates viewable by customers
                </span>
              </div>
            </div>
          </div>
        )}

        {/* add / edit dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Payment" : "Add a Payment"}</DialogTitle>
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
              <Button onClick={submitPayment} disabled={!Number(amount)}>
                {editing ? "Save" : "Add Payment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
