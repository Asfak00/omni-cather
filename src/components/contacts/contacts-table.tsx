"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FilePlus2, Loader2, RefreshCw, Search } from "lucide-react";
import type { GHLContact } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ContactsTable() {
  const router = useRouter();
  const [contacts, setContacts] = React.useState<GHLContact[]>([]);
  const [source, setSource] = React.useState<"ghl" | "mock">("mock");
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [creatingFor, setCreatingFor] = React.useState<string | null>(null);

  const load = React.useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const res = await fetch(`/api/ghl/contacts${params}`);
      if (!res.ok) throw new Error("Failed to load contacts");
      const data = await res.json();
      setContacts(data.contacts);
      setSource(data.source);
    } catch {
      toast.error("Could not load contacts from GHL");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => load(query || undefined), 350);
    return () => clearTimeout(t);
  }, [query, load]);

  async function makeContract(contact: GHLContact) {
    setCreatingFor(contact.id);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: contact.id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(
        data.created
          ? `Contract created for ${contact.name}`
          : `Opening existing draft for ${contact.name}`
      );
      router.push(`/contracts/${data.contract.id}`);
    } catch {
      toast.error("Failed to create contract");
      setCreatingFor(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Contacts</CardTitle>
          <CardDescription>
            Leads from your GHL reservation form.{" "}
            {source === "mock" && (
              <Badge variant="outline" className="ml-1 text-amber-600 border-amber-300">
                Demo data — connect GHL in .env
              </Badge>
            )}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="w-56 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => load(query || undefined)}>
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No contacts found.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Tags</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {contact.companyName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {contact.companyName ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {contact.email ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {contact.phone ?? "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(contact.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant={tag === "lead" ? "default" : "secondary"}
                          className="text-[10px] uppercase"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => makeContract(contact)}
                      disabled={creatingFor !== null}
                    >
                      {creatingFor === contact.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <FilePlus2 className="size-4" />
                      )}
                      Make Contract
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
