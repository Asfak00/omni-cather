import type { EventStatus } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<EventStatus, string> = {
  PROSPECT: "bg-(--status-prospect) text-white",
  TENTATIVE: "bg-(--status-tentative) text-white",
  DEFINITE: "bg-(--status-definite) text-white",
  CLOSED: "bg-(--status-closed) text-white",
  LOST: "bg-(--status-lost) text-white",
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
