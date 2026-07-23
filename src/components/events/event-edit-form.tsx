"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Clock, Loader2, Lock, Plus, Trash2 } from "lucide-react";
import type { Contract, EventStatus, RestaurantSettings } from "@/types";
import { contractTotals, currency, formatTime } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import { ContactsSection } from "@/components/contract/contacts-section";
import { cn } from "@/lib/utils";

const STATUSES: { value: EventStatus; color: string }[] = [
  { value: "PROSPECT", color: "bg-teal-600" },
  { value: "TENTATIVE", color: "bg-rose-500" },
  { value: "DEFINITE", color: "bg-emerald-500" },
  { value: "CLOSED", color: "bg-yellow-600" },
  { value: "LOST", color: "bg-gray-500" },
];

const LEAD_SOURCE_OPTIONS = [
  "Reservation Form",
  "GHL Web Lead",
  "Referral",
  "Walk-in",
  "Facebook",
  "Instagram",
  "Phone Call",
  "Other",
];

interface Props {
  initialContract: Contract;
  settings: RestaurantSettings;
  /** all events, used for the "Events for {date}" rail */
  allContracts: Contract[];
}

export function EventEditForm({ initialContract, settings, allContracts }: Props) {
  const router = useRouter();
  const [contract, setContract] = React.useState(initialContract);
  const [saving, setSaving] = React.useState(false);
  const [showSetup, setShowSetup] = React.useState(
    Boolean(contract.setupTime || contract.teardownTime)
  );

  const update = (patch: Partial<Contract>) =>
    setContract((prev) => ({ ...prev, ...patch }));

  const totals = contractTotals(contract);

  const sameDayEvents = contract.date
    ? allContracts.filter((c) => c.id !== contract.id && c.date === contract.date)
    : [];

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contract),
      });
      if (!res.ok) throw new Error();
      toast.success("Event updated");
      router.push(`/events/${contract.id}`);
    } catch {
      toast.error("Failed to update event");
      setSaving(false);
    }
  }

  const toggleArea = (areaId: string, checked: boolean) =>
    update({
      areaIds: checked
        ? [...contract.areaIds, areaId]
        : contract.areaIds.filter((id) => id !== areaId),
    });

  return (
    <div className="space-y-4 pb-24">
      <h1>Editing {contract.eventName || "Event"}</h1>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* -------- Event Details -------- */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-primary">Event Details</CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="ticketed" className="text-sm font-medium">
                  Ticketed Event
                </Label>
                <Switch
                  id="ticketed"
                  checked={contract.ticketedEvent}
                  onCheckedChange={(v) => update({ ticketedEvent: v })}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-10 gap-y-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <FieldRow label="Event Name">
                    <Input
                      value={contract.eventName}
                      onChange={(e) => update({ eventName: e.target.value })}
                    />
                  </FieldRow>

                  <FieldRow label="Booking">
                    <div>
                      <p className="py-1 text-sm text-primary">
                        {contract.bookingName}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => {
                          const name = window.prompt(
                            "Booking name",
                            contract.bookingName
                          );
                          if (name) update({ bookingName: name });
                        }}
                      >
                        ✎ Edit or Reassign
                      </Button>
                    </div>
                  </FieldRow>

                  <FieldRow label="Date" hint={`e.g., ${format(new Date(), "M/d/yyyy")}`}>
                    <DatePicker
                      value={contract.date}
                      onChange={(date) => update({ date })}
                    />
                  </FieldRow>

                  <FieldRow label="Start Time" hint="e.g., 6pm">
                    <TimeInput
                      value={contract.startTime}
                      onChange={(startTime) => update({ startTime })}
                    />
                  </FieldRow>

                  <FieldRow label="End Time" hint="e.g., 10pm">
                    <TimeInput
                      value={contract.endTime}
                      onChange={(endTime) => update({ endTime })}
                    />
                  </FieldRow>

                  <FieldRow label="">
                    {showSetup ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Setup
                          </Label>
                          <TimeInput
                            value={contract.setupTime ?? ""}
                            onChange={(setupTime) => update({ setupTime })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Teardown
                          </Label>
                          <TimeInput
                            value={contract.teardownTime ?? ""}
                            onChange={(teardownTime) => update({ teardownTime })}
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setShowSetup(true)}
                      >
                        + Add Setup / Teardown Time
                      </Button>
                    )}
                  </FieldRow>

                  <FieldRow label="Status">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                      {STATUSES.map((s) => (
                        <label
                          key={s.value}
                          className="flex cursor-pointer items-center gap-2"
                        >
                          <span
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full border-2",
                              contract.status === s.value
                                ? "border-primary"
                                : "border-muted-foreground/40"
                            )}
                          >
                            {contract.status === s.value && (
                              <span className="size-2 rounded-full bg-primary" />
                            )}
                          </span>
                          <input
                            type="radio"
                            name="status"
                            className="sr-only"
                            checked={contract.status === s.value}
                            onChange={() => update({ status: s.value })}
                          />
                          <span
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-bold uppercase text-white",
                              s.color
                            )}
                          >
                            {s.value}
                          </span>
                        </label>
                      ))}
                    </div>
                  </FieldRow>
                </div>

                <div className="space-y-4">
                  <FieldRow label="Event style">
                    <Select
                      value={contract.eventStyle}
                      onValueChange={(v) => update({ eventStyle: v ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.eventStyles.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="Area(s)">
                    <div className="space-y-1.5">
                      {settings.areas
                        .filter((a) => !a.parentId)
                        .map((area) => (
                          <React.Fragment key={area.id}>
                            <AreaCheckbox
                              id={area.id}
                              label={area.name}
                              capacity={area.capacity}
                              checked={contract.areaIds.includes(area.id)}
                              onCheckedChange={(v) => toggleArea(area.id, v)}
                            />
                            {settings.areas
                              .filter((sub) => sub.parentId === area.id)
                              .map((sub) => (
                                <AreaCheckbox
                                  key={sub.id}
                                  id={sub.id}
                                  label={sub.name}
                                  capacity={sub.capacity}
                                  indent
                                  checked={contract.areaIds.includes(sub.id)}
                                  onCheckedChange={(v) => toggleArea(sub.id, v)}
                                />
                              ))}
                          </React.Fragment>
                        ))}
                    </div>
                  </FieldRow>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* -------- Contacts -------- */}
          <ContactsSection contract={contract} onChange={update} />

          {/* -------- Guests / owner grid -------- */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-x-10 gap-y-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <FieldRow label="Expected Guests">
                    <Input
                      type="number"
                      min={0}
                      className="w-36"
                      value={contract.expectedGuests || ""}
                      onChange={(e) =>
                        update({ expectedGuests: Number(e.target.value) || 0 })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Guaranteed Guests">
                    <Input
                      type="number"
                      min={0}
                      className="w-36"
                      value={contract.guaranteedGuests || ""}
                      onChange={(e) =>
                        update({
                          guaranteedGuests: Number(e.target.value) || undefined,
                        })
                      }
                    />
                  </FieldRow>
                  <FieldRow label="Meal Periods">
                    <Input
                      value={contract.mealPeriods ?? ""}
                      onChange={(e) => update({ mealPeriods: e.target.value })}
                    />
                  </FieldRow>
                  <FieldRow label="Type of Event">
                    <Select
                      value={contract.eventType ?? ""}
                      onValueChange={(v) => update({ eventType: v ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.eventTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>

                <div className="space-y-4">
                  <FieldRow label="Owner">
                    <Select
                      value={contract.ownerId}
                      onValueChange={(v) => update({ ownerId: v ?? "" })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {settings.owners.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldRow>

                  <FieldRow label="Managers">
                    <div className="space-y-2">
                      {(contract.managerIds ?? []).map((id, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Select
                            value={id}
                            onValueChange={(v) =>
                              v &&
                              update({
                                managerIds: (contract.managerIds ?? []).map(
                                  (m, j) => (j === i ? v : m)
                                ),
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {settings.owners.map((o) => (
                                <SelectItem key={o.id} value={o.id}>
                                  {o.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() =>
                              update({
                                managerIds: (contract.managerIds ?? []).filter(
                                  (_, j) => j !== i
                                ),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          update({
                            managerIds: [
                              ...(contract.managerIds ?? []),
                              settings.owners[0]?.id ?? "",
                            ],
                          })
                        }
                      >
                        <Plus className="size-3" /> Add a Manager
                      </Button>
                    </div>
                  </FieldRow>

                  <FieldRow label="Lead Sources">
                    <div className="space-y-2">
                      {(contract.leadSources ?? []).map((src, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Select
                            value={src}
                            onValueChange={(v) =>
                              v &&
                              update({
                                leadSources: (contract.leadSources ?? []).map(
                                  (s, j) => (j === i ? v : s)
                                ),
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Please Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_SOURCE_OPTIONS.map((o) => (
                                <SelectItem key={o} value={o}>
                                  {o}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive"
                            onClick={() =>
                              update({
                                leadSources: (contract.leadSources ?? []).filter(
                                  (_, j) => j !== i
                                ),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() =>
                          update({
                            leadSources: [
                              ...(contract.leadSources ?? []),
                              LEAD_SOURCE_OPTIONS[0],
                            ],
                          })
                        }
                      >
                        <Plus className="size-3" /> Add a Lead Source
                      </Button>
                    </div>
                  </FieldRow>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* -------- Event Financials (locked, from contract) -------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Event Financials</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
                <div className="space-y-3">
                  <LockedRow
                    label="F&B Minimum"
                    value={currency(contract.billing.fbMinimum || 0)}
                  />
                  <LockedRow
                    label="Rental Fee"
                    value={currency(contract.billing.roomRental || 0)}
                  />
                  <LockedRow label="Forecast" value="" />
                  <LockedRow label="Deposit amount" value={currency(totals.deposit)} />
                  <LockedRow label="Actual amount" value={currency(totals.subtotal)} />
                </div>
                <div className="space-y-3">
                  <LockedRow label="Grand total" value={currency(totals.grandTotal)} />
                  <LockedRow label="Amount due" value={currency(totals.remaining)} />
                  <LockedRow
                    label="Price per person"
                    value={
                      totals.pricePerPerson ? currency(totals.pricePerPerson) : "—"
                    }
                  />
                  <FieldRow label="Deposit Type">
                    <Select
                      value={contract.billing.depositMode ?? "percent"}
                      onValueChange={(v) =>
                        v &&
                        update({
                          billing: {
                            ...contract.billing,
                            depositMode: v as "percent" | "amount",
                          },
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Please select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">
                          Percent of Grand Total
                        </SelectItem>
                        <SelectItem value="amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldRow>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3" /> Locked values come from the Contract
                &amp; Event Order —{" "}
                <Link
                  href={`/contracts/${contract.id}`}
                  className="text-primary underline"
                >
                  edit the contract
                </Link>{" "}
                to change them.
              </p>
            </CardContent>
          </Card>

          {/* -------- Custom Fields -------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Custom Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-x-10 gap-y-3 lg:grid-cols-2">
                <FieldRow label="Deposit Due Date">
                  <DatePicker
                    value={contract.billing.depositDueDate}
                    onChange={(depositDueDate) =>
                      update({
                        billing: { ...contract.billing, depositDueDate },
                      })
                    }
                    clearable
                  />
                </FieldRow>
                <FieldRow label="Balance Due Date">
                  <DatePicker
                    value={contract.billing.balanceDueDate}
                    onChange={(balanceDueDate) =>
                      update({
                        billing: { ...contract.billing, balanceDueDate },
                      })
                    }
                    clearable
                  />
                </FieldRow>
              </div>
            </CardContent>
          </Card>

          {/* -------- Additional Information -------- */}
          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={3}
                value={contract.additionalInformation ?? ""}
                onChange={(e) => update({ additionalInformation: e.target.value })}
                placeholder="Anything else about this event..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-primary">Referred By</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={contract.referredBy ?? ""}
                onChange={(e) => update({ referredBy: e.target.value })}
                placeholder="e.g. Facebook, existing client..."
              />
            </CardContent>
          </Card>
        </div>

        {/* -------- right rail: events for the selected date -------- */}
        <div>
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>
                Events for{" "}
                {contract.date
                  ? format(new Date(`${contract.date}T00:00:00`), "M/d/yyyy")
                  : "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sameDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No events were found for the selected date.
                </p>
              ) : (
                <div className="space-y-2">
                  {sameDayEvents.map((e) => (
                    <Link
                      key={e.id}
                      href={`/events/${e.id}`}
                      className="block rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <span className="block font-medium">{e.eventName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(e.startTime)} – {formatTime(e.endTime)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 backdrop-blur md:left-64">
        <div className="flex items-center justify-end gap-2 px-6 py-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/events/${contract.id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- small pieces ---------------- */

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-3">
      <Label className="pt-2.5 justify-end text-right text-sm font-semibold">
        {label}
      </Label>
      <div>
        {children}
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

function LockedRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center gap-3 text-sm">
      <span className="text-right font-semibold">{label}</span>
      <span className="flex items-center gap-1.5">
        {value}
        <Lock className="size-3 text-muted-foreground" />
      </span>
    </div>
  );
}

function AreaCheckbox({
  id,
  label,
  capacity,
  indent,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  capacity: number;
  indent?: boolean;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className={cn("flex items-center gap-2", indent && "ml-6")}>
      <Checkbox
        id={`area-${id}`}
        checked={checked}
        onCheckedChange={(v) => onCheckedChange(v === true)}
      />
      <Label htmlFor={`area-${id}`} className="cursor-pointer text-sm font-normal">
        {label}{" "}
        <span className="italic text-muted-foreground">({capacity} capacity)</span>
      </Label>
    </div>
  );
}

function TimeInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="time"
        className="pl-9"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
