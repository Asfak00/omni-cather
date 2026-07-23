"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Clock,
  Copy,
  FilePen,
  MapPin,
  Paperclip,
  Pencil,
  Settings,
  Trash2,
  ChevronDown,
} from "lucide-react";
import type { Contract, RestaurantSettings } from "@/types";
import { contractTotals, currency, formatTime } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/contract/status-badge";
import { DetailsTab } from "./tabs/details-tab";
import { DocsTab } from "./tabs/docs-tab";
import { DiscussionTab } from "./tabs/discussion-tab";
import { PaymentsTab } from "./tabs/payments-tab";
import { TasksTab, NotesTab, LogTab } from "./tabs/activity-tabs";

interface GHLLinks {
  contact: string;
  documents: string;
  invoices: string;
  conversations: string;
}

interface Props {
  initialContract: Contract;
  settings: RestaurantSettings;
  ghlLinks: GHLLinks;
}

export function EventView({ initialContract, settings, ghlLinks }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contract, setContract] = React.useState(initialContract);
  const [showHistory, setShowHistory] = React.useState(false);
  const [tab, setTab] = React.useState(searchParams.get("tab") ?? "details");

  const totals = contractTotals(contract);
  const areaNames = contract.areaIds
    .map((id) => settings.areas.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  /** Persist a partial update and keep local state in sync */
  const patch = React.useCallback(
    async (partial: Partial<Contract>) => {
      // optimistic
      setContract((prev) => ({ ...prev, ...partial }));
      const res = await fetch(`/api/contracts/${contract.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      if (!res.ok) {
        toast.error("Failed to save changes");
        return;
      }
      const data = await res.json();
      setContract(data.contract);
    },
    [contract.id]
  );

  async function copyEvent() {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duplicateOf: contract.id }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Event copied");
      router.push(`/events/${data.contract.id}`);
    } else toast.error("Failed to copy event");
  }

  async function deleteEvent() {
    if (!window.confirm("Delete this event and its contract?")) return;
    const res = await fetch(`/api/contracts/${contract.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Event deleted");
      router.push("/events");
    } else toast.error("Failed to delete event");
  }

  return (
    <div className="space-y-4">
      {/* page header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={contract.status} />
          <h1>{contract.eventName}</h1>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {contract.date && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {format(new Date(`${contract.date}T00:00:00`), "EEE, MMM d, yyyy")} •{" "}
              {formatTime(contract.startTime)} – {formatTime(contract.endTime)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin className="size-4" />
            {settings.venueName}
            {areaNames && ` • ${areaNames}`}
          </span>
        </div>
        {totals.remaining > 0 && (
          <div className="mt-2 inline-block rounded border border-primary/40 px-2.5 py-1 text-sm text-primary">
            {currency(totals.remaining)} in outstanding payments
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          {/* summary card */}
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex justify-end gap-2">
                <Button
                  render={<Link href={`/events/${contract.id}/edit`} />}
                  size="sm"
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button size="sm" />}>
                    <Settings className="size-3.5" /> Actions{" "}
                    <ChevronDown className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      render={<Link href={`/contracts/${contract.id}`} />}
                    >
                      <FilePen className="size-4" /> Edit Contract &amp; Event Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={copyEvent}>
                      <Copy className="size-4" /> Copy Event
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={deleteEvent}>
                      <Trash2 className="size-4" /> Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-x-10 gap-y-1.5 text-sm sm:grid-cols-2">
                <div className="space-y-1.5">
                  <SummaryRow label="Event Name" value={contract.eventName} />
                  <SummaryRow
                    label="Booking"
                    value={
                      <span className="text-primary">{contract.bookingName}</span>
                    }
                  />
                  <SummaryRow label="Event Id" value={contract.eventId} />
                  <SummaryRow
                    label="When"
                    value={
                      contract.date ? (
                        <span>
                          {format(
                            new Date(`${contract.date}T00:00:00`),
                            "EEE, MMM d, yyyy"
                          )}
                          <span className="mt-0.5 flex items-center gap-1 text-muted-foreground">
                            <Clock className="size-3.5" />
                            {formatTime(contract.startTime)} to{" "}
                            {formatTime(contract.endTime)}
                          </span>
                        </span>
                      ) : (
                        "TBD"
                      )
                    }
                  />
                  <SummaryRow
                    label="Status"
                    value={
                      <span>
                        <span className="flex items-center gap-2">
                          <StatusBadge status={contract.status} />
                          <button
                            type="button"
                            className="rounded border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted"
                            onClick={() => setShowHistory((v) => !v)}
                          >
                            {showHistory ? "hide" : "show"} status history
                          </button>
                        </span>
                        {showHistory && (
                          <span className="mt-2 block space-y-1">
                            {[...(contract.statusHistory ?? [])]
                              .reverse()
                              .map((h, i) => (
                                <span
                                  key={i}
                                  className="flex flex-wrap items-center gap-1.5 text-xs"
                                >
                                  {h.from && (
                                    <>
                                      <StatusBadge status={h.from} />
                                      <span className="text-muted-foreground">to</span>
                                    </>
                                  )}
                                  <StatusBadge status={h.to} />
                                  <span className="text-muted-foreground">
                                    on {format(new Date(h.at), "M/d/yyyy 'at' h:mm a")}{" "}
                                    by {h.by}
                                  </span>
                                </span>
                              ))}
                            {(contract.statusHistory ?? []).length === 0 && (
                              <span className="text-xs text-muted-foreground">
                                No status changes yet.
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <SummaryRow label="Area(s)" value={areaNames || "—"} />
                  <SummaryRow label="Event Style" value={contract.eventStyle} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* tabs */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as string)}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="docs">
                Docs{" "}
                <Badge variant="secondary" className="ml-1 size-5 justify-center rounded-full p-0">
                  {contract.documents.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="discussion">
                Discussion{" "}
                <Badge variant="secondary" className="ml-1 size-5 justify-center rounded-full p-0">
                  {(contract.messages ?? []).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="payments">
                Payments{" "}
                <Badge variant="secondary" className="ml-1 size-5 justify-center rounded-full p-0">
                  {(contract.payments ?? []).length + 1}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="log">Log</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <DetailsTab contract={contract} settings={settings} totals={totals} />
            </TabsContent>
            <TabsContent value="docs" className="mt-4">
              <DocsTab
                contract={contract}
                totals={totals}
                ghlLinks={ghlLinks}
                onDeleted={() => router.push("/events")}
              />
            </TabsContent>
            <TabsContent value="discussion" className="mt-4">
              <DiscussionTab contract={contract} settings={settings} onPatch={patch} />
            </TabsContent>
            <TabsContent value="payments" className="mt-4">
              <PaymentsTab contract={contract} totals={totals} onPatch={patch} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-4">
              <TasksTab contract={contract} onPatch={patch} />
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <NotesTab contract={contract} settings={settings} onPatch={patch} />
            </TabsContent>
            <TabsContent value="log" className="mt-4">
              <LogTab contract={contract} settings={settings} />
            </TabsContent>
          </Tabs>
        </div>

        {/* right rail */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h4 className="mb-2 font-semibold">Attached files</h4>
              <p className="text-sm text-muted-foreground">No Files</p>
              <Button variant="outline" size="sm" className="mt-3">
                <Paperclip className="size-3.5" /> Choose a File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-3">
      <span className="pt-0.5 text-right text-xs font-bold text-foreground/80">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
