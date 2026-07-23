"use client";

import { ExternalLink, Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A clickable piece of contact information.
 *  - email → mailto:
 *  - phone → tel:
 *  - link  → arbitrary href (e.g. the contact's GHL page)
 */
export function ContactValue({
  type,
  value,
  href,
  className,
  showIcon = false,
}: {
  type: "email" | "phone" | "link";
  value: string;
  href?: string;
  className?: string;
  showIcon?: boolean;
}) {
  const url =
    type === "email"
      ? `mailto:${value}`
      : type === "phone"
        ? `tel:${value.replace(/[^+\d]/g, "")}`
        : href;

  if (!url) return <span className={className}>{value}</span>;

  const Icon = type === "email" ? Mail : type === "phone" ? Phone : ExternalLink;

  return (
    <a
      href={url}
      {...(type === "link" ? { target: "_blank", rel: "noopener" } : {})}
      className={cn(
        "inline-flex items-center gap-1 text-primary hover:underline",
        className
      )}
    >
      {showIcon && <Icon className="size-3.5" />}
      {value}
    </a>
  );
}
