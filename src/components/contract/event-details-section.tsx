"use client";

import * as React from "react";
import { Calendar, Clock } from "lucide-react";
import type { Contract, EventStatus, RestaurantSettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const STATUSES: { value: EventStatus; color: string }[] = [
  { value: "PROSPECT", color: "bg-teal-600" },
  { value: "TENTATIVE", color: "bg-rose-500" },
  { value: "DEFINITE", color: "bg-emerald-500" },
  { value: "CLOSED", color: "bg-yellow-600" },
  { value: "LOST", color: "bg-gray-500" },
];

interface Props {
  contract: Contract;
  settings: RestaurantSettings;
  onChange: (patch: Partial<Contract>) => void;
}

export function EventDetailsSection({ contract, settings, onChange }: Props) {
  const [showSetup, setShowSetup] = React.useState(
    Boolean(contract.setupTime || contract.teardownTime)
  );

  const toggleArea = (areaId: string, checked: boolean) => {
    onChange({
      areaIds: checked
        ? [...contract.areaIds, areaId]
        : contract.areaIds.filter((id) => id !== areaId),
    });
  };

  return (
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
            onCheckedChange={(v) => onChange({ ticketedEvent: v })}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-x-10 gap-y-4 lg:grid-cols-2">
          {/* ---- left column ---- */}
          <div className="space-y-4">
            <FieldRow label="Event Name">
              <Input
                value={contract.eventName}
                onChange={(e) => onChange({ eventName: e.target.value })}
              />
            </FieldRow>

            <FieldRow label="Booking">
              <div>
                <p className="text-sm py-1.5">{contract.bookingName}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const name = window.prompt(
                      "Booking name",
                      contract.bookingName
                    );
                    if (name) onChange({ bookingName: name });
                  }}
                >
                  ✎ Edit or Reassign
                </Button>
              </div>
            </FieldRow>

            <FieldRow label="Date" hint="e.g., 7/14/2026">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={contract.date}
                  onChange={(e) => onChange({ date: e.target.value })}
                />
              </div>
            </FieldRow>

            <FieldRow label="Start Time" hint="e.g., 6pm">
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={contract.startTime}
                  onChange={(e) => onChange({ startTime: e.target.value })}
                />
              </div>
            </FieldRow>

            <FieldRow label="End Time" hint="e.g., 10pm">
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-9"
                  value={contract.endTime}
                  onChange={(e) => onChange({ endTime: e.target.value })}
                />
              </div>
            </FieldRow>

            <FieldRow label="">
              {showSetup ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Setup</Label>
                    <Input
                      type="time"
                      value={contract.setupTime ?? ""}
                      onChange={(e) => onChange({ setupTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Teardown</Label>
                    <Input
                      type="time"
                      value={contract.teardownTime ?? ""}
                      onChange={(e) => onChange({ teardownTime: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
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
                      onChange={() => onChange({ status: s.value })}
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

          {/* ---- right column ---- */}
          <div className="space-y-4">
            <FieldRow label="Event style">
              <Select
                value={contract.eventStyle}
                onValueChange={(v) => onChange({ eventStyle: v ?? "" })}
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

            <FieldRow label="Event type">
              <Select
                value={contract.eventType ?? ""}
                onValueChange={(v) => onChange({ eventType: v ?? "" })}
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

            <FieldRow label="Expected Guests">
              <Input
                type="number"
                min={0}
                className="w-32"
                value={contract.expectedGuests || ""}
                onChange={(e) =>
                  onChange({ expectedGuests: Number(e.target.value) || 0 })
                }
              />
            </FieldRow>

            <FieldRow label="Owner">
              <Select
                value={contract.ownerId}
                onValueChange={(v) => onChange({ ownerId: v ?? "" })}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <div className="grid grid-cols-[110px_1fr] items-start gap-3">
      <Label className="pt-2 text-sm font-semibold">{label}</Label>
      <div>
        {children}
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
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
        <span className="italic text-muted-foreground">
          ({capacity} capacity)
        </span>
      </Label>
    </div>
  );
}
