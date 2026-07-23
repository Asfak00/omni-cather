"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  AlertCircle,
  ChevronDown,
  Copy,
  Eye,
  GripVertical,
  MoreHorizontal,
  Move,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Undo2,
} from "lucide-react";
import type {
  ApplicableCharge,
  MenuGroup,
  MenuItem,
  RestaurantSettings,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CHARGES: ApplicableCharge[] = ["Admin Fee", "Gratuity", "Sales Tax"];

function randomId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
const reflow = (s: string) => s.replace(/\s+/g, " ").trim();

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

type View = { kind: "list" } | { kind: "new" } | { kind: "edit"; id: string };

export function PicklistsManager({ settings, onChange }: Props) {
  const [view, setView] = React.useState<View>({ kind: "list" });
  const menus = settings.menus;

  const patchMenu = (id: string, patch: Partial<MenuGroup>) =>
    onChange({
      menus: menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });

  if (view.kind === "new") {
    return (
      <NewPicklist
        onCancel={() => setView({ kind: "list" })}
        onCreate={(name, description) => {
          const menu: MenuGroup = {
            id: randomId("menu"),
            name,
            description,
            defaultSection: "food",
            items: [],
            createdAt: new Date().toISOString(),
          };
          onChange({ menus: [...menus, menu] });
          setView({ kind: "edit", id: menu.id });
        }}
      />
    );
  }

  if (view.kind === "edit") {
    const menu = menus.find((m) => m.id === view.id);
    if (menu) {
      return (
        <PicklistEditor
          menu={menu}
          settings={settings}
          onPatch={(patch) => patchMenu(menu.id, patch)}
          onDone={() => setView({ kind: "list" })}
        />
      );
    }
  }

  return (
    <PicklistList
      menus={menus}
      onReorder={(ordered) => onChange({ menus: ordered })}
      onNew={() => setView({ kind: "new" })}
      onEdit={(id) => setView({ kind: "edit", id })}
      onCopy={(id) => {
        const src = menus.find((m) => m.id === id);
        if (!src) return;
        const copy: MenuGroup = {
          ...src,
          id: randomId("menu"),
          name: `${src.name} (Copy)`,
          items: src.items.map((i) => ({ ...i, id: randomId("item") })),
          createdAt: new Date().toISOString(),
        };
        onChange({ menus: [...menus, copy] });
        toast.success("Picklist copied");
      }}
      onDelete={(id) => patchMenu(id, { deleted: true })}
      onRestore={(id) => patchMenu(id, { deleted: false })}
    />
  );
}

/* ================= list ================= */

function PicklistList({
  menus,
  onReorder,
  onNew,
  onEdit,
  onCopy,
  onDelete,
  onRestore,
}: {
  menus: MenuGroup[];
  onReorder: (menus: MenuGroup[]) => void;
  onNew: () => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const visible = menus.filter(
    (m) =>
      (showDeleted || !m.deleted) &&
      (!query.trim() || m.name.toLowerCase().includes(query.toLowerCase()))
  );

  const reorder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ordered = [...menus];
    const from = ordered.findIndex((m) => m.id === dragId);
    const to = ordered.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    onReorder(ordered);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search by name..."
            className="w-56"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={showDeleted}
              onCheckedChange={(v) => setShowDeleted(v === true)}
            />
            Show deleted fields
          </label>
          <Button variant="outline" size="sm" onClick={() => setQuery("")}>
            clear filters
          </Button>
          <div className="ml-auto">
            <Button onClick={onNew}>
              <Plus className="size-4" /> New Picklist
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-[40px_1.6fr_1fr_1fr_60px] items-center gap-2 border-b px-4 py-2 text-sm font-semibold text-muted-foreground">
            <span />
            <span>Name</span>
            <span>Location Count</span>
            <span>Created</span>
            <span />
          </div>
          {visible.map((menu, i) => (
            <div
              key={menu.id}
              draggable={dragId === menu.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(menu.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                reorder(menu.id);
                setDragId(null);
                setOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              className={cn(
                "grid grid-cols-[40px_1.6fr_1fr_1fr_60px] items-center gap-2 px-4 py-2.5",
                i % 2 === 0 && "bg-muted/30",
                menu.deleted && "opacity-50",
                overId === menu.id && dragId !== menu.id && "ring-2 ring-primary/30"
              )}
            >
              <button
                type="button"
                className="cursor-grab text-muted-foreground active:cursor-grabbing"
                title="Drag to reorder"
                onMouseDown={() => setDragId(menu.id)}
              >
                <Move className="size-4" />
              </button>
              <button
                type="button"
                className="cursor-pointer text-left text-sm hover:text-primary hover:underline"
                onClick={() => onEdit(menu.id)}
              >
                {menu.name}
                {menu.deleted && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (deleted)
                  </span>
                )}
              </button>
              <span className="text-sm">1</span>
              <span className="text-sm">
                {menu.createdAt
                  ? format(new Date(menu.createdAt), "EEE, MMM d, yyyy")
                  : "—"}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={<Button variant="outline" size="icon-sm" />}
                >
                  <Settings className="size-3.5" />
                  <ChevronDown className="size-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                    <Eye className="size-4" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(menu.id)}>
                    <Pencil className="size-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopy(menu.id)}>
                    <Copy className="size-4" /> Copy
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {menu.deleted ? (
                    <DropdownMenuItem onClick={() => onRestore(menu.id)}>
                      <Undo2 className="size-4" /> Restore
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(menu.id)}
                    >
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {visible.length === 0 && (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No picklists match your filters.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= new picklist ================= */

function NewPicklist({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, description: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="mb-4 text-lg font-semibold">New Picklist</h2>
        <div className="max-w-xl space-y-4">
          <div>
            <Label className="font-semibold">Name</Label>
            <Input
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            <p className="mt-1 text-xs text-muted-foreground">
              e.g. &quot;Chicken Dishes&quot;
            </p>
          </div>
          <div>
            <Label className="font-semibold">Description</Label>
            <Textarea
              className="mt-1.5"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2 border-t pt-4">
          <Button disabled={!name.trim()} onClick={() => onCreate(name, description)}>
            OK - On to Adding Items
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ================= picklist editor ================= */

function PicklistEditor({
  menu,
  settings,
  onPatch,
  onDone,
}: {
  menu: MenuGroup;
  settings: RestaurantSettings;
  onPatch: (patch: Partial<MenuGroup>) => void;
  onDone: () => void;
}) {
  const categories = settings.categories.filter((c) => !c.deleted);
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());
  const [massCharges, setMassCharges] = React.useState<ApplicableCharge[]>([]);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  // add-item form
  const [newItem, setNewItem] = React.useState({
    qty: "",
    name: "",
    altDescription: "",
    category: "",
    charges: [] as ApplicableCharge[],
    position: "bottom",
  });

  const patchItem = (id: string, patch: Partial<MenuItem>) =>
    onPatch({
      items: menu.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });

  const reorder = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ordered = [...menu.items];
    const from = ordered.findIndex((i) => i.id === dragId);
    const to = ordered.findIndex((i) => i.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    onPatch({ items: ordered });
  };

  const applyCategoryDefaults = (itemId: string, categoryName: string) => {
    const cat = categories.find((c) => c.name === categoryName);
    patchItem(itemId, {
      category: categoryName,
      ...(cat ? { applicableCharges: [...cat.defaultCharges] } : {}),
    });
  };

  const addItem = () => {
    if (!newItem.name.trim()) return;
    const item: MenuItem = {
      id: randomId("item"),
      name: newItem.name,
      description: newItem.altDescription,
      defaultQty: Number(newItem.qty) || undefined,
      price: null,
      category: newItem.category,
      applicableCharges: [...newItem.charges],
    };
    onPatch({
      items:
        newItem.position === "top" ? [item, ...menu.items] : [...menu.items, item],
    });
    setNewItem({
      qty: "",
      name: "",
      altDescription: "",
      category: "",
      charges: [],
      position: newItem.position,
    });
  };

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <h2 className="text-lg font-semibold">Edit Picklist {menu.name}</h2>

        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          Please note: picklists can be shared among locations you do not have
          access to. Any edits will update this picklist for all locations.
        </div>

        <div className="grid max-w-2xl gap-4">
          <div>
            <Label className="font-semibold">Name</Label>
            <Input
              className="mt-1.5"
              value={menu.name}
              onChange={(e) => onPatch({ name: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              e.g. &quot;Chicken Dishes&quot;
            </p>
          </div>
          <div>
            <Label className="font-semibold">Description</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={menu.description ?? ""}
              onChange={(e) => onPatch({ description: e.target.value })}
            />
          </div>
          <div>
            <Label className="font-semibold">Default contract section</Label>
            <Select
              value={menu.defaultSection}
              onValueChange={(v) =>
                v && onPatch({ defaultSection: v as MenuGroup["defaultSection"] })
              }
            >
              <SelectTrigger className="mt-1.5 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
                <SelectItem value="other">Other Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ---- line items ---- */}
        <div className="border-t pt-4">
          <h3 className="mb-3 text-base font-semibold text-primary">Line Items</h3>

          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-6">
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Mass-assign this category:
                </Label>
                <Select
                  value=""
                  onValueChange={(v) => {
                    if (!v) return;
                    const cat = categories.find((c) => c.name === v);
                    onPatch({
                      items: menu.items.map((i) =>
                        i.isHeader
                          ? i
                          : {
                              ...i,
                              category: v,
                              applicableCharges: cat
                                ? [...cat.defaultCharges]
                                : i.applicableCharges,
                            }
                      ),
                    });
                    toast.success(`Category "${v}" assigned to all items`);
                  }}
                >
                  <SelectTrigger className="mt-1 w-56">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Mass-assign to these billing items:
                </Label>
                <div className="mt-1.5 flex gap-4">
                  {CHARGES.map((charge) => (
                    <label
                      key={charge}
                      className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"
                    >
                      <Checkbox
                        checked={massCharges.includes(charge)}
                        onCheckedChange={(v) => {
                          const next =
                            v === true
                              ? [...massCharges, charge]
                              : massCharges.filter((c) => c !== charge);
                          setMassCharges(next);
                          onPatch({
                            items: menu.items.map((i) =>
                              i.isHeader ? i : { ...i, applicableCharges: next }
                            ),
                          });
                        }}
                      />
                      {charge}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onPatch({
                    items: menu.items.map((i) => ({
                      ...i,
                      name: stripHtml(i.name),
                      description: i.description
                        ? stripHtml(i.description)
                        : i.description,
                    })),
                  });
                  toast.success("Bad formatting stripped");
                }}
              >
                Strip Bad Formatting
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onPatch({
                    items: menu.items.map((i) => ({
                      ...i,
                      name: reflow(i.name),
                      description: i.description
                        ? reflow(i.description)
                        : i.description,
                    })),
                  });
                  toast.success("Markup reflowed");
                }}
              >
                Reflow Markup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExpanded(
                    expanded.size === menu.items.length
                      ? new Set()
                      : new Set(menu.items.map((i) => i.id))
                  )
                }
              >
                Expand All
              </Button>
            </div>
          </div>

          {/* header row */}
          <div className="grid grid-cols-[28px_60px_1fr_110px_110px_64px] items-center gap-2 border-b pb-1 text-[11px] font-semibold uppercase text-muted-foreground">
            <span />
            <span>Qty.</span>
            <span>Description</span>
            <span>Price</span>
            <span>Total</span>
            <span />
          </div>

          {/* items */}
          {menu.items.map((item, i) => (
            <div
              key={item.id}
              draggable={dragId === item.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(item.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                reorder(item.id);
                setDragId(null);
                setOverId(null);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              className={cn(
                "border-b",
                i % 2 === 0 && "bg-muted/20",
                overId === item.id && dragId !== item.id && "ring-2 ring-primary/30"
              )}
            >
              <div className="grid grid-cols-[28px_60px_1fr_110px_110px_64px] items-center gap-2 py-2">
                <button
                  type="button"
                  className="cursor-grab text-muted-foreground active:cursor-grabbing"
                  onMouseDown={() => setDragId(item.id)}
                  title="Drag to reorder"
                >
                  <GripVertical className="size-4" />
                </button>
                <Input
                  className="h-9"
                  value={item.defaultQty ?? ""}
                  onChange={(e) =>
                    patchItem(item.id, {
                      defaultQty: Number(e.target.value) || undefined,
                    })
                  }
                />
                <div>
                  <Input
                    className={cn("h-9", item.isHeader && "font-bold")}
                    value={item.name}
                    onChange={(e) => patchItem(item.id, { name: e.target.value })}
                  />
                  {item.description !== undefined && !item.isHeader && (
                    <Input
                      className="mt-1 h-8 text-xs text-muted-foreground"
                      value={item.description}
                      placeholder="Alternate description"
                      onChange={(e) =>
                        patchItem(item.id, { description: e.target.value })
                      }
                    />
                  )}
                </div>
                <Input
                  className="h-9"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={item.isHeader}
                  value={item.price ?? ""}
                  onChange={(e) =>
                    patchItem(item.id, {
                      price: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
                <Input
                  className="h-9"
                  disabled
                  value={
                    item.price != null && item.defaultQty
                      ? (item.price * item.defaultQty).toFixed(2)
                      : ""
                  }
                />
                <span className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-xs"
                    title="More options"
                    onClick={() =>
                      setExpanded((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) next.delete(item.id);
                        else next.add(item.id);
                        return next;
                      })
                    }
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-destructive"
                    onClick={() =>
                      onPatch({
                        items: menu.items.filter((x) => x.id !== item.id),
                      })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </span>
              </div>

              {expanded.has(item.id) && (
                <div className="grid gap-4 bg-muted/40 px-10 py-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Category
                    </Label>
                    <Select
                      value={item.category || undefined}
                      onValueChange={(v) =>
                        v && applyCategoryDefaults(item.id, v)
                      }
                    >
                      <SelectTrigger className="mt-1 w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Applicable taxes, fees, gratuity, etc.
                    </Label>
                    <div className="mt-1.5 space-y-1">
                      {CHARGES.map((charge) => (
                        <label
                          key={charge}
                          className="flex cursor-pointer items-center gap-1.5 text-xs"
                        >
                          <Checkbox
                            checked={item.applicableCharges.includes(charge)}
                            onCheckedChange={(v) =>
                              patchItem(item.id, {
                                applicableCharges:
                                  v === true
                                    ? [...item.applicableCharges, charge]
                                    : item.applicableCharges.filter(
                                        (c) => c !== charge
                                      ),
                              })
                            }
                          />
                          {charge}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                      Row type
                    </Label>
                    <label className="mt-1.5 flex cursor-pointer items-center gap-1.5 text-xs">
                      <Checkbox
                        checked={item.isHeader ?? false}
                        onCheckedChange={(v) =>
                          patchItem(item.id, { isHeader: v === true })
                        }
                      />
                      Section header (not selectable)
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* ---- add item form ---- */}
          <div className="mt-4 rounded-md border bg-muted/20 p-4">
            <div className="grid grid-cols-[60px_1fr_110px_110px] items-end gap-2">
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Qty.
                </Label>
                <Input
                  className="mt-1 h-9"
                  value={newItem.qty}
                  onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Description
                </Label>
                <Input
                  className="mt-1 h-9"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Price
                </Label>
                <Input className="mt-1 h-9" type="number" disabled placeholder="—" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                  Total
                </Label>
                <Input className="mt-1 h-9" disabled />
              </div>
            </div>
            <div className="mt-2">
              <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                Alternate description
              </Label>
              <Input
                className="mt-1 h-9"
                value={newItem.altDescription}
                onChange={(e) =>
                  setNewItem({ ...newItem, altDescription: e.target.value })
                }
              />
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={newItem.category || undefined}
                    onValueChange={(v) => {
                      if (!v) return;
                      const cat = categories.find((c) => c.name === v);
                      setNewItem({
                        ...newItem,
                        category: v,
                        charges: cat ? [...cat.defaultCharges] : newItem.charges,
                      });
                    }}
                  >
                    <SelectTrigger className="mt-1 w-44">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Applicable taxes, fees, gratuity, etc.
                  </Label>
                  <div className="mt-1.5 flex gap-4">
                    {CHARGES.map((charge) => (
                      <label
                        key={charge}
                        className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground"
                      >
                        <Checkbox
                          checked={newItem.charges.includes(charge)}
                          onCheckedChange={(v) =>
                            setNewItem({
                              ...newItem,
                              charges:
                                v === true
                                  ? [...newItem.charges, charge]
                                  : newItem.charges.filter((c) => c !== charge),
                            })
                          }
                        />
                        {charge}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div>
                  <Label className="text-[11px] font-semibold uppercase text-muted-foreground">
                    Position
                  </Label>
                  <Select
                    value={newItem.position}
                    onValueChange={(v) =>
                      v && setNewItem({ ...newItem, position: v })
                    }
                  >
                    <SelectTrigger className="mt-1 w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Add to Bottom</SelectItem>
                      <SelectItem value="top">Add to Top</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addItem} disabled={!newItem.name.trim()}>
                  <Plus className="size-4" /> Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button onClick={onDone}>Update</Button>
          <Button variant="outline" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
