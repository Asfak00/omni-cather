"use client";

import { Plus, Trash2 } from "lucide-react";
import type { RestaurantSettings, VenueArea } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function randomId() {
  return `area_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

const NO_PARENT = "__none__";

interface Props {
  settings: RestaurantSettings;
  onChange: (patch: Partial<RestaurantSettings>) => void;
}

export function AreasManager({ settings, onChange }: Props) {
  const areas = settings.areas;

  const patchArea = (id: string, patch: Partial<VenueArea>) =>
    onChange({ areas: areas.map((a) => (a.id === id ? { ...a, ...patch } : a)) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Areas</CardTitle>
        <CardDescription>
          Areas selectable on a contract's event details, with capacity. Nest an
          area under a parent to indent it (e.g. VIP Room inside Main Floor).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {areas.map((area) => (
          <div
            key={area.id}
            className="grid grid-cols-[1fr_130px_180px_32px] items-center gap-2"
          >
            <Input
              value={area.name}
              onChange={(e) => patchArea(area.id, { name: e.target.value })}
            />
            <Input
              type="number"
              min={0}
              placeholder="Capacity"
              value={area.capacity || ""}
              onChange={(e) =>
                patchArea(area.id, { capacity: Number(e.target.value) || 0 })
              }
            />
            <Select
              value={area.parentId ?? NO_PARENT}
              onValueChange={(v) =>
                patchArea(area.id, { parentId: v === NO_PARENT ? null : v })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PARENT}>Top level</SelectItem>
                {areas
                  .filter((a) => a.id !== area.id && !a.parentId)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      Inside {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive"
              onClick={() =>
                onChange({ areas: areas.filter((a) => a.id !== area.id) })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onChange({
              areas: [
                ...areas,
                { id: randomId(), name: "New Area", capacity: 0, parentId: null },
              ],
            })
          }
        >
          <Plus className="size-3.5" /> Add Area
        </Button>
      </CardContent>
    </Card>
  );
}
