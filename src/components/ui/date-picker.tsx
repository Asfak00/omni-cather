"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * shadcn Calendar-based date picker that works with "yyyy-MM-dd"
 * string values (how dates are stored on contracts).
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  clearable = false,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  clearable?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(`${value}T00:00:00`) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start bg-transparent text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {date ? format(date, "M/d/yyyy") : placeholder}
        {clearable && date && (
          <X
            className="ml-auto size-3.5 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
          />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
