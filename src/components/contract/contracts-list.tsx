"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { FileText, Files, MoreHorizontal, Trash2 } from "lucide-react";
import type { Contract } from "@/types";
import { contractTotals, currency } from "@/lib/calculations";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ContractsList() {
  const [contracts, setContracts] = React.useState<Contract[] | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/contracts");
      const data = await res.json();
      setContracts(data.contracts);
    } catch {
      toast.error("Failed to load contracts");
      setContracts([]);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Contract deleted");
      load();
    } else {
      toast.error("Failed to delete contract");
    }
  }

  if (contracts === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No contracts yet</CardTitle>
          <CardDescription>
            Contracts start from GHL — click “Make Contract” on a contact
            there, or see{" "}
            <Link href="/make-contract" className="underline text-primary">
              how to set up the GHL link
            </Link>
            .
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className="hidden md:table-cell">Contact</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Grand Total
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((c) => {
              const totals = contractTotals(c);
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link
                      href={`/contracts/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.eventName || "Untitled event"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      #{c.orderNumber}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {c.contactSnapshot.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {c.date ? format(new Date(`${c.date}T00:00:00`), "M/d/yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right font-medium">
                    {currency(totals.grandTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        render={<Link href={`/contracts/${c.id}`} />}
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="size-4" /> Edit
                      </Button>
                      <Button
                        render={<Link href={`/contracts/${c.id}/docs`} />}
                        variant="outline"
                        size="sm"
                      >
                        <Files className="size-4" /> Docs
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={<Button variant="ghost" size="icon-sm" />}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => remove(c.id)}
                          >
                            <Trash2 className="size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
