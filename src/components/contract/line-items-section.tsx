"use client";

import * as React from "react";
import { Expand } from "lucide-react";
import type {
  ContractLineItem,
  ItemCategory,
  LineItemSection,
  MenuGroup,
} from "@/types";
import { currency, lineItemTotal } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LineItemRow } from "./line-item-row";
import { AddFromMenuDialog } from "./add-from-menu-dialog";

const SECTION_LABELS: Record<LineItemSection, string> = {
  food: "Food",
  beverage: "Beverage",
  other: "Other Items",
};

function randomId() {
  return `li_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  section: LineItemSection;
  items: ContractLineItem[];
  menus: MenuGroup[];
  categories: ItemCategory[];
  expectedGuests: number;
  onItemsChange: (items: ContractLineItem[]) => void;
}

export function LineItemsSection({
  section,
  items,
  menus,
  categories,
  expectedGuests,
  onItemsChange,
}: Props) {
  const sectionItems = items.filter((i) => i.section === section);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);
  const total = sectionItems.reduce((sum, i) => sum + lineItemTotal(i), 0);

  /** Drop `dragId` at the position of `targetId` within this section */
  const reorder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ordered = [...sectionItems];
    const from = ordered.findIndex((i) => i.id === dragId);
    const to = ordered.findIndex((i) => i.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    // other sections keep their internal order; this section is re-written
    onItemsChange([...items.filter((i) => i.section !== section), ...ordered]);
  };

  const updateItem = (id: string, patch: Partial<ContractLineItem>) => {
    onItemsChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const deleteItem = (id: string) => {
    onItemsChange(items.filter((i) => i.id !== id));
  };

  const addFreehand = () => {
    const item: ContractLineItem = {
      id: randomId(),
      section,
      qty: 0,
      description: "",
      price: 0,
      category: "",
      applicableCharges: ["Admin Fee", "Gratuity", "Sales Tax"],
      discount: null,
    };
    onItemsChange([...items, item]);
    setExpanded((prev) => new Set(prev).add(item.id));
  };

  const addFromMenu = (added: ContractLineItem[]) => {
    onItemsChange([...items, ...added]);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setExpanded((prev) =>
      prev.size === sectionItems.length
        ? new Set()
        : new Set(sectionItems.map((i) => i.id))
    );
  };

  return (
    <Card className="pt-0">
      {/* section tab */}
      <div className="flex items-center justify-between border-b px-4">
        <div className="-mb-px inline-block rounded-t-md border border-b-card bg-card px-4 py-2 text-sm font-medium">
          {SECTION_LABELS[section]}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={toggleAll}
        >
          <Expand className="size-3.5" /> all
        </Button>
      </div>

      <CardContent className="space-y-2 pt-4">
        {/* column headers */}
        <div className="flex items-center gap-2 px-2 text-xs font-semibold text-muted-foreground">
          <span className="w-4" />
          <span className="w-20">Qty.</span>
          <span className="flex-1">Description</span>
          <span className="w-28">Price</span>
          <span className="w-28 text-right">Total</span>
          <span className="w-[68px]" />
        </div>

        {sectionItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No items selected.
          </p>
        ) : (
          sectionItems.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              categories={categories}
              expanded={expanded.has(item.id)}
              onToggleExpand={() => toggleExpand(item.id)}
              onChange={(patch) => updateItem(item.id, patch)}
              onDelete={() => deleteItem(item.id)}
              isDragging={dragId === item.id}
              isDragOver={dragOverId === item.id && dragId !== item.id}
              onDragStart={() => setDragId(item.id)}
              onDragEnd={() => {
                setDragId(null);
                setDragOverId(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverId(item.id);
              }}
              onDrop={() => {
                reorder(item.id);
                setDragId(null);
                setDragOverId(null);
              }}
            />
          ))
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <AddFromMenuDialog
              section={section}
              menus={menus}
              expectedGuests={expectedGuests}
              onAdd={addFromMenu}
            />
            <Button type="button" variant="outline" size="sm" onClick={addFreehand}>
              Add Freehand
            </Button>
          </div>
          <p className="text-sm font-semibold">Total: {currency(total)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
