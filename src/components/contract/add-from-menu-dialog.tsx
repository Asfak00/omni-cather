"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type {
  ContractLineItem,
  LineItemSection,
  MenuGroup,
  MenuItem,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function randomId() {
  return `li_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  section: LineItemSection;
  menus: MenuGroup[];
  expectedGuests: number;
  onAdd: (items: ContractLineItem[]) => void;
}

export function AddFromMenuDialog({ section, menus, expectedGuests, onAdd }: Props) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set());
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [qtys, setQtys] = React.useState<Record<string, number>>({});

  // Reset selection whenever the dialog opens
  React.useEffect(() => {
    if (open) {
      setSelected(new Set());
      setQtys({});
      setSearch("");
      setOpenGroups(new Set());
    }
  }, [open]);

  const q = search.toLowerCase().trim();
  const visibleMenus = menus
    .map((menu) => ({
      ...menu,
      items: q
        ? menu.items.filter((i) =>
            [i.name, i.description].filter(Boolean).some((v) =>
              String(v).toLowerCase().includes(q)
            )
          )
        : menu.items,
    }))
    .filter((menu) => !q || menu.items.length > 0);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItem = (item: MenuItem, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(item.id);
      else next.delete(item.id);
      return next;
    });
  };

  const toggleSelectAllInGroup = (menu: MenuGroup, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const item of menu.items) {
        if (item.isHeader) continue;
        if (checked) next.add(item.id);
        else next.delete(item.id);
      }
      return next;
    });
  };

  const addSelected = () => {
    const added: ContractLineItem[] = [];
    for (const menu of menus) {
      for (const item of menu.items) {
        if (!selected.has(item.id) || item.isHeader) continue;
        added.push({
          id: randomId(),
          section: menu.defaultSection ?? section,
          qty: qtys[item.id] ?? expectedGuests ?? 1,
          description: item.name,
          altDescription: item.description,
          price: item.price ?? 0,
          category: item.category,
          applicableCharges: [...item.applicableCharges],
          discount: null,
          menuItemId: item.id,
        });
      }
    }
    // Items added from the "Food" section dialog stay in food unless
    // the menu says otherwise; force current section when adding here.
    onAdd(added.map((a) => ({ ...a, section })));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" />}>
        Add from Menu
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Items to Add</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search available items"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />

        <ScrollArea className="-mx-1 min-h-0 flex-1 px-1">
          <div className="space-y-2 py-1">
            {visibleMenus.map((menu) => {
              const isOpen = openGroups.has(menu.id) || Boolean(q);
              const selectable = menu.items.filter((i) => !i.isHeader);
              const allSelected =
                selectable.length > 0 &&
                selectable.every((i) => selected.has(i.id));
              return (
                <div key={menu.id} className="rounded-md border">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium hover:bg-muted/50"
                    onClick={() => toggleGroup(menu.id)}
                  >
                    <span>{menu.name}</span>
                    {isOpen ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t px-3 pb-3">
                      <div className="flex items-center gap-2 py-2">
                        <Checkbox
                          id={`selall-${menu.id}`}
                          checked={allSelected}
                          onCheckedChange={(v) =>
                            toggleSelectAllInGroup(menu, v === true)
                          }
                        />
                        <label
                          htmlFor={`selall-${menu.id}`}
                          className="cursor-pointer text-sm"
                        >
                          Select All
                        </label>
                      </div>

                      <div className="grid grid-cols-[24px_70px_1fr_90px] items-center gap-x-2 border-b pb-1 text-[11px] font-semibold uppercase text-muted-foreground">
                        <span />
                        <span>Qty.</span>
                        <span>Description</span>
                        <span className="text-right">Price</span>
                      </div>

                      {menu.items.map((item) =>
                        item.isHeader ? (
                          <div
                            key={item.id}
                            className="grid grid-cols-[24px_70px_1fr_90px] gap-x-2 py-2"
                          >
                            <span />
                            <span />
                            <div>
                              <p className="text-sm font-bold">{item.name}</p>
                              {item.description && (
                                <p className="text-xs italic text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <span />
                          </div>
                        ) : (
                          <div
                            key={item.id}
                            className={cn(
                              "grid grid-cols-[24px_70px_1fr_90px] items-center gap-x-2 py-2",
                              selected.has(item.id) && "bg-primary/5"
                            )}
                          >
                            <Checkbox
                              checked={selected.has(item.id)}
                              onCheckedChange={(v) => toggleItem(item, v === true)}
                            />
                            <Input
                              type="number"
                              min={0}
                              className="h-8"
                              placeholder={String(expectedGuests || 1)}
                              value={qtys[item.id] ?? ""}
                              onChange={(e) =>
                                setQtys((prev) => ({
                                  ...prev,
                                  [item.id]: Number(e.target.value) || 0,
                                }))
                              }
                            />
                            <div>
                              <p className="text-sm">{item.name}</p>
                              {item.description && (
                                <p className="text-xs text-muted-foreground">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <p className="text-right text-sm text-muted-foreground">
                              {item.price != null
                                ? `$ ${item.price.toFixed(2)}`
                                : "$"}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {visibleMenus.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No menu items match your search.
              </p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-3">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={addSelected}
            disabled={selected.size === 0}
          >
            Add Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
