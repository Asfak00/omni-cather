"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FilePlus2,
  Settings2,
  Palette,
  UtensilsCrossed,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  {
    label: "Workspace",
    items: [
      { href: "/events", label: "Events", icon: CalendarDays },
      { href: "/make-contract", label: "Make Contract (from GHL)", icon: FilePlus2 },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings/restaurant", label: "Restaurant Settings", icon: UtensilsCrossed },
      { href: "/settings/theme", label: "Theme & Appearance", icon: Palette },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2 px-5 h-16 border-b">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarRange className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-sm">Event Manager</p>
          <p className="text-xs text-muted-foreground">GoHighLevel</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground font-medium"
                          : "text-foreground/80 hover:bg-muted"
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

      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Settings2 className="size-3.5" />
          <span>Synced with GHL sub-account</span>
        </div>
      </div>
    </aside>
  );
}
