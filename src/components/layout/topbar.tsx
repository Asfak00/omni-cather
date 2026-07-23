"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  Palette,
  Plus,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/settings/restaurant", label: "Restaurant Settings", icon: UtensilsCrossed },
  { href: "/settings/theme", label: "Theme", icon: Palette },
];

/**
 * Top header — brand, navigation and settings in one bar. The dark
 * surface is derived from the theme's primary color, so it always
 * follows the configured brand palette.
 */
export function Topbar() {
  const pathname = usePathname();

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-2 px-4 text-white md:px-6"
      style={{ background: "color-mix(in oklab, var(--primary), black 62%)" }}
    >
      {/* brand */}
      <Link href="/events" className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarRange className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Event Manager</p>
          <p className="text-xs text-white/60">OmniCather</p>
        </div>
      </Link>

      {/* nav */}
      <nav className="ml-6 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary font-medium text-primary-foreground shadow"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* actions */}
      <Button
        render={<Link href="/make-contract" />}
        size="sm"
        className="shrink-0"
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">New Event</span>
      </Button>
    </header>
  );
}
