"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type {
  ApplicableCharge,
  LineItemCategory,
  LineItemSection,
  MenuGroup,
  MenuItem,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const CATEGORIES: LineItemCategory[] = [
  "Audio/Visual",
  "Beverage",
  "Food",
  "Labor",
  "Misc",
];
const CHARGES: ApplicableCharge[] = ["Admin Fee", "Gratuity", "Sales Tax"];
const SECTIONS: { value: LineItemSection; label: string }[] = [
  { value: "food", label: "Food" },
  { value: "beverage", label: "Beverage" },
  { value: "other", label: "Other Items" },
];

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  menus: MenuGroup[];
  onChange: (menus: MenuGroup[]) => void;
}

export function MenuManager({ menus, onChange }: Props) {
  const [openGroups, setOpenGroups] = React.useState<Set<string>>(new Set());

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const patchGroup = (id: string, patch: Partial<MenuGroup>) =>
    onChange(menus.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const addGroup = () => {
    const group: MenuGroup = {
      id: randomId("menu"),
      name: "New Menu",
      defaultSection: "food",
      items: [],
    };
    onChange([...menus, group]);
    setOpenGroups((prev) => new Set(prev).add(group.id));
  };

  const patchItem = (groupId: string, itemId: string, patch: Partial<MenuItem>) =>
    patchGroup(groupId, {
      items: menus
        .find((m) => m.id === groupId)!
        .items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    });

  const addItem = (group: MenuGroup, isHeader: boolean) =>
    patchGroup(group.id, {
      items: [
        ...group.items,
        {
          id: randomId("item"),
          name: isHeader ? "SECTION HEADER" : "New Item",
          description: "",
          price: isHeader ? null : 0,
          category: group.defaultSection === "beverage" ? "Beverage" : "Food",
          applicableCharges: isHeader ? [] : [...CHARGES],
          isHeader,
        },
      ],
    });

  return (
    <div className="space-y-3">
      {menus.map((menu) => {
        const isOpen = openGroups.has(menu.id);
        return (
          <Card key={menu.id} className="py-0">
            <div className="flex items-center gap-2 px-4 py-3">
              <button type="button" onClick={() => toggleGroup(menu.id)}>
                {isOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </button>
              <Input
                className="max-w-xs font-medium"
                value={menu.name}
                onChange={(e) => patchGroup(menu.id, { name: e.target.value })}
              />
              <Select
                value={menu.defaultSection}
                onValueChange={(v) =>
                  patchGroup(menu.id, { defaultSection: v as LineItemSection })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      → {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="ml-auto text-xs text-muted-foreground">
                {menu.items.filter((i) => !i.isHeader).length} items
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => onChange(menus.filter((m) => m.id !== menu.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {isOpen && (
              <CardContent className="space-y-2 border-t pt-4">
                {menu.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_1fr_110px_130px_150px_32px] items-start gap-2 rounded-md border bg-muted/20 p-2"
                  >
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        {item.isHeader ? "Header text" : "Item name"}
                      </Label>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          patchItem(menu.id, item.id, { name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Description
                      </Label>
                      <Input
                        value={item.description ?? ""}
                        onChange={(e) =>
                          patchItem(menu.id, item.id, {
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Price ($)
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        disabled={item.isHeader}
                        value={item.price ?? ""}
                        onChange={(e) =>
                          patchItem(menu.id, item.id, {
                            price:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Category
                      </Label>
                      <Select
                        value={item.category}
                        onValueChange={(v) =>
                          patchItem(menu.id, item.id, {
                            category: v as LineItemCategory,
                          })
                        }
                      >
                        <SelectTrigger className="w-full" disabled={item.isHeader}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground">
                        Charges
                      </Label>
                      <div className="mt-1 space-y-1">
                        {CHARGES.map((charge) => (
                          <div key={charge} className="flex items-center gap-1.5">
                            <Checkbox
                              id={`${item.id}-${charge}`}
                              disabled={item.isHeader}
                              checked={item.applicableCharges.includes(charge)}
                              onCheckedChange={(v) =>
                                patchItem(menu.id, item.id, {
                                  applicableCharges:
                                    v === true
                                      ? [...item.applicableCharges, charge]
                                      : item.applicableCharges.filter(
                                          (c) => c !== charge
                                        ),
                                })
                              }
                            />
                            <label
                              htmlFor={`${item.id}-${charge}`}
                              className="text-[11px]"
                            >
                              {charge}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="mt-4 text-destructive"
                      onClick={() =>
                        patchGroup(menu.id, {
                          items: menu.items.filter((i) => i.id !== item.id),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(menu, false)}
                  >
                    <Plus className="size-3.5" /> Add Item
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addItem(menu, true)}
                  >
                    <Plus className="size-3.5" /> Add Header Row
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Button onClick={addGroup}>
        <Plus className="size-4" /> Add Menu
      </Button>
    </div>
  );
}
