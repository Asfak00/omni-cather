import type { EventStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<EventStatus, string> = {
  PROSPECT: "bg-teal-600 text-white",
  TENTATIVE: "bg-rose-500 text-white",
  DEFINITE: "bg-emerald-500 text-white",
  CLOSED: "bg-yellow-600 text-white",
  LOST: "bg-gray-500 text-white",
};

export function StatusBadge({
  status,
  className,
}: {
  status: EventStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </span>
  );
}
