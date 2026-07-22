"use client";

import { format } from "date-fns";
import type { Contract, RestaurantSettings } from "@/types";
import { formatTime } from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** "Multiple Events Table" summary block, mirroring the doc template */
export function EventsTableBlock({
  contract,
  settings,
}: {
  contract: Contract;
  settings: RestaurantSettings;
}) {
  const areaNames = contract.areaIds
    .map((id) => settings.areas.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Multiple Events Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold text-foreground">Date</TableHead>
              <TableHead className="font-bold text-foreground">Time</TableHead>
              <TableHead className="font-bold text-foreground">Location</TableHead>
              <TableHead className="font-bold text-foreground">Areas</TableHead>
              <TableHead className="font-bold text-foreground">Event Type</TableHead>
              <TableHead className="font-bold text-foreground">Guests</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                {contract.date
                  ? format(new Date(`${contract.date}T00:00:00`), "M/d/yyyy")
                  : "—"}
              </TableCell>
              <TableCell>
                {formatTime(contract.startTime)} – {formatTime(contract.endTime)}
              </TableCell>
              <TableCell>{settings.venueName}</TableCell>
              <TableCell>{areaNames || "—"}</TableCell>
              <TableCell>{contract.eventType || "—"}</TableCell>
              <TableCell>{contract.expectedGuests || "—"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
