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
      className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-border text-white md:px-6"
    >
      {/* nav */}
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
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
                  : "text-black"
              )}
            >
              <item.icon className="size-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </header>
  );
}
