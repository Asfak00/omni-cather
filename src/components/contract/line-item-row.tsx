"use client";

import * as React from "react";
import { GripVertical, Maximize2, Minimize2, Trash2 } from "lucide-react";
import type {
  ApplicableCharge,
  ContractLineItem,
  ItemCategory,
} from "@/types";
import { currency, lineItemTotal } from "@/lib/calculations";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CHARGES: ApplicableCharge[] = ["Admin Fee", "Gratuity", "Sales Tax"];

interface Props {
  item: ContractLineItem;
  /** categories from Restaurant Settings, with default billing details */
  categories: ItemCategory[];
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (patch: Partial<ContractLineItem>) => void;
  onDelete: () => void;
  /* drag & drop reordering */
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}

export function LineItemRow({
  item,
  categories,
  expanded,
  onToggleExpand,
  onChange,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: Props) {
  const total = lineItemTotal(item);
  const missingCategory = !item.category;
  const [dragEnabled, setDragEnabled] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-md border bg-muted/20 transition-opacity",
        isDragging && "opacity-40",
        isDragOver && "border-primary ring-2 ring-primary/30"
      )}
      draggable={dragEnabled}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.();
      }}
      onDragEnd={() => {
        setDragEnabled(false);
        onDragEnd?.();
      }}
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
    >
      {/* main row */}
      <div className="flex items-start gap-2 p-2">
        <button
          type="button"
          className="mt-2 cursor-grab text-muted-foreground active:cursor-grabbing"
          title="Drag to reorder"
          // only the grip arms the row for dragging, so text
          // selection inside inputs keeps working
          onMouseDown={() => setDragEnabled(true)}
          onMouseUp={() => setDragEnabled(false)}
        >
          <GripVertical className="size-4" />
        </button>

        <div className="w-20">
          <Input
            type="number"
            min={0}
            placeholder="Qty."
            value={item.qty || ""}
            onChange={(e) => onChange({ qty: Number(e.target.value) || 0 })}
          />
        </div>

        <div className="min-w-0 flex-1">
          {/* looks like an input; focusing reveals the rich-text toolbar */}
          <RichTextEditor
            inline
            placeholder="Description"
            value={item.description}
            onChange={(description) => onChange({ description })}
          />
          {missingCategory && (
            <div className="mt-1 rounded-sm bg-red-400/90 px-2 py-0.5 text-center text-[11px] font-medium text-white">
              ● No category assigned
            </div>
          )}
        </div>

        <div className="relative w-28">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            step="0.01"
            className="pl-6"
            value={item.price || ""}
            onChange={(e) => onChange({ price: Number(e.target.value) || 0 })}
          />
        </div>

        <div className="w-28 py-2 text-right text-sm font-medium">
          {currency(total)}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onToggleExpand}
          title={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <Minimize2 className="size-3.5" />
          ) : (
            <Maximize2 className="size-3.5" />
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* expanded detail */}
      {expanded && (
        <div className="space-y-3 border-t px-11 py-3">
          {item.discount ? (
            <div className="flex items-end gap-2">
              <div>
                <Label className="text-xs">Discount type</Label>
                <Select
                  value={item.discount.type}
                  onValueChange={(v) =>
                    onChange({
                      discount: {
                        ...item.discount!,
                        type: v as "percent" | "amount",
                      },
                    })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percent %</SelectItem>
                    <SelectItem value="amount">Amount $</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  type="number"
                  min={0}
                  className="w-28"
                  value={item.discount.value || ""}
                  onChange={(e) =>
                    onChange({
                      discount: {
                        ...item.discount!,
                        value: Number(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ discount: null })}
              >
                Remove Discount
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onChange({ discount: { type: "percent", value: 0 } })}
            >
              Add Discount
            </Button>
          )}

          <div>
            <Label className="text-xs font-semibold">
              Alternate (Long) Description
            </Label>
            <Input
              className="mt-1"
              value={item.altDescription ?? ""}
              onChange={(e) => onChange({ altDescription: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-semibold">Category</Label>
              <Select
                value={item.category || undefined}
                onValueChange={(v) => {
                  if (!v) return;
                  // assigning a category applies its default billing details
                  const cat = categories.find((c) => c.name === v);
                  onChange({
                    category: v,
                    ...(cat ? { applicableCharges: [...cat.defaultCharges] } : {}),
                  });
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => !c.deleted)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">
                Applicable Taxes, Fees, Gratuity, etc.
              </Label>
              <div className="mt-1.5 space-y-1.5">
                {CHARGES.map((charge) => (
                  <div key={charge} className="flex items-center gap-2">
                    <Checkbox
                      id={`${item.id}-${charge}`}
                      checked={item.applicableCharges.includes(charge)}
                      onCheckedChange={(v) =>
                        onChange({
                          applicableCharges:
                            v === true
                              ? [...item.applicableCharges, charge]
                              : item.applicableCharges.filter((c) => c !== charge),
                        })
                      }
                    />
                    <Label
                      htmlFor={`${item.id}-${charge}`}
                      className="cursor-pointer text-sm font-normal"
                    >
                      {charge}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
