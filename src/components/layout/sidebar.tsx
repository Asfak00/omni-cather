"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Settings2,
  Palette,
  UtensilsCrossed,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    label: "Workspace",
    items: [{ href: "/events", label: "Events", icon: CalendarDays }],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings/restaurant", label: "Restaurant Settings", icon: UtensilsCrossed },
      { href: "/settings/theme", label: "Theme & Appearance", icon: Palette },
    ],
  },
];

/**
 * GHL-style dark sidebar — the surface color is derived from the
 * theme's primary color so it always matches the configured brand.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden w-64 shrink-0 flex-col text-white md:flex"
      style={{
        background: "color-mix(in oklab, var(--primary), black 62%)",
      }}
    >
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarRange className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Event Manager</p>
          <p className="text-xs text-white/60">Omni Cather</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-3">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wider text-white/50">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm transition-colors",
                        active
                          ? "bg-primary font-medium text-primary-foreground shadow"
                          : "text-white/75 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Settings2 className="size-3.5" />
          <span>Synced with Omni Cather</span>
        </div>
      </div>
    </aside>
  );
}
