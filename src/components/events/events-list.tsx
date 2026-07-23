"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isSameDay, differenceInCalendarDays } from "date-fns";
import { toast } from "sonner";
import {
  CalendarDays,
  ChevronDown,
  DatabaseZap,
  Eye,
  Loader2,
  Plus,
  Search,
  Users,
} from "lucide-react";
import type { Contract, RestaurantSettings } from "@/types";
import { contractTotals, currency, formatTime } from "@/lib/calculations";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_CHIP: Record<string, string> = {
  PROSPECT: "bg-(--status-prospect)",
  TENTATIVE: "bg-(--status-tentative)",
  DEFINITE: "bg-(--status-definite)",
  CLOSED: "bg-(--status-closed)",
  LOST: "bg-(--status-lost)",
};

type Filter = "upcoming" | "all";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  contracts: Contract[];
  settings: RestaurantSettings;
}

export function EventsList({ contracts, settings }: Props) {
  const router = useRouter();
  const [filter, setFilter] = React.useState<Filter>("upcoming");
  const [query, setQuery] = React.useState("");
  const [seeding, setSeeding] = React.useState(false);

  async function loadDemoData() {
    setSeeding(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Demo events loaded");
      router.refresh();
    } catch {
      toast.error("Failed to load demo data");
    } finally {
      setSeeding(false);
    }
  }

  const today = new Date();
  const q = query.toLowerCase().trim();

  const filtered = contracts.filter((c) => {
    if (q && !c.eventName.toLowerCase().includes(q)) return false;
    if (filter === "upcoming") {
      if (!c.date) return true; // undated drafts stay visible
      return differenceInCalendarDays(new Date(`${c.date}T00:00:00`), today) >= 0;
    }
    return true;
  });

  const dateOf = (c: Contract) =>
    c.date ? new Date(`${c.date}T00:00:00`) : null;

  const groups: { title: string; events: Contract[] }[] = [
    {
      title: "Today's Events",
      events: filtered.filter((c) => {
        const d = dateOf(c);
        return d && isSameDay(d, today);
      }),
    },
    {
      title: "Events in the Next 7 Days",
      events: filtered.filter((c) => {
        const d = dateOf(c);
        if (!d) return false;
        const diff = differenceInCalendarDays(d, today);
        return diff > 0 && diff <= 7;
      }),
    },
    {
      title: "Events more than 7 Days out",
      events: filtered.filter((c) => {
        const d = dateOf(c);
        return d && differenceInCalendarDays(d, today) > 7;
      }),
    },
    {
      title: "Undated Drafts",
      events: filtered.filter((c) => !c.date),
    },
    ...(filter === "all"
      ? [
          {
            title: "Past Events",
            events: filtered.filter((c) => {
              const d = dateOf(c);
              return d && differenceInCalendarDays(d, today) < 0;
            }),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button />}>
            <Eye className="size-4" />
            {filter === "upcoming" ? "Upcoming Events" : "All Events"}
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setFilter("upcoming")}>
              <CalendarDays className="size-4" /> Upcoming Events
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("all")}>
              <CalendarDays className="size-4" /> All Events
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by Name..."
            className="w-64 pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {contracts.length === 0 && (
            <Button variant="outline" onClick={loadDemoData} disabled={seeding}>
              {seeding ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <DatabaseZap className="size-4" />
              )}
              Load Demo Data
            </Button>
          )}
          <Button render={<Link href="/make-contract" />}>
            <Plus className="size-4" /> New Event
          </Button>
        </div>
      </div>

      {groups
        .filter((g) => g.title !== "Undated Drafts" || g.events.length > 0)
        .map((group) => (
          <Card key={group.title} className="overflow-hidden py-0">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold">{group.title}</h3>
            </div>
            {group.events.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted-foreground">
                No Events found matching the current filter criteria
              </p>
            ) : (
              <div>
                <div className="grid grid-cols-[40px_1.4fr_1.2fr_1fr_1fr] items-center gap-3 border-b px-5 py-2 text-xs font-semibold text-muted-foreground">
                  <span />
                  <span>Name</span>
                  <span>Who</span>
                  <span>When</span>
                  <span>Where</span>
                </div>
                {group.events.map((event) => (
                  <EventRow key={event.id} event={event} settings={settings} />
                ))}
              </div>
            )}
          </Card>
        ))}
    </div>
  );
}

function EventRow({
  event,
  settings,
}: {
  event: Contract;
  settings: RestaurantSettings;
}) {
  const router = useRouter();
  const totals = contractTotals(event);
  const areaNames = event.areaIds
    .map((id) => settings.areas.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <button
      type="button"
      onClick={() => router.push(`/events/${event.id}`)}
      className="grid w-full grid-cols-[40px_1.4fr_1.2fr_1fr_1fr] items-center gap-3 border-b px-5 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded text-[11px] font-bold text-white",
          STATUS_CHIP[event.status]
        )}
        title={event.status}
      >
        {event.status[0]}
      </span>

      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">
          {event.eventName || "Untitled event"}
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="size-3" />
          {event.expectedGuests || 0} exp. guests
          <span className="font-medium text-foreground/70">
            {currency(totals.subtotal)} Actual
          </span>
        </span>
      </span>

      <span className="flex min-w-0 items-center gap-2.5">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs font-semibold text-muted-foreground">
            {initials(event.contactSnapshot.name)}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0">
          <span className="block truncate text-sm">{event.contactSnapshot.name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {event.contactSnapshot.companyName}
          </span>
        </span>
      </span>

      <span className="text-sm">
        {event.date ? (
          <>
            <span className="block font-medium">
              {format(new Date(`${event.date}T00:00:00`), "EEE, MMM d, yyyy")}
            </span>
            <span className="text-xs text-muted-foreground">
              🕐 {formatTime(event.startTime)} — {formatTime(event.endTime)}
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">No date set</span>
        )}
      </span>

      <span className="text-sm">
        <span className="block font-medium">{areaNames || "—"}</span>
        <span className="text-xs text-muted-foreground">{settings.venueName}</span>
      </span>
    </button>
  );
}
