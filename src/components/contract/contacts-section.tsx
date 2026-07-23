"use client";

import * as React from "react";
import { Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Contract, GHLContact } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Props {
  contract: Contract;
  onChange: (patch: Partial<Contract>) => void;
}

export function ContactsSection({ contract, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<GHLContact[]>([]);
  const [extraContacts, setExtraContacts] = React.useState<GHLContact[]>([]);

  React.useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/ghl/contacts${query ? `?q=${encodeURIComponent(query)}` : ""}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(
          (data.contacts as GHLContact[]).filter(
            (c) =>
              c.id !== contract.contactId &&
              !contract.additionalContactIds.includes(c.id)
          )
        );
      }
    }, 300);
    return () => clearTimeout(t);
  }, [open, query, contract.contactId, contract.additionalContactIds]);

  function addContact(contact: GHLContact) {
    onChange({
      additionalContactIds: [...contract.additionalContactIds, contact.id],
    });
    setExtraContacts((prev) => [...prev, contact]);
    setOpen(false);
    toast.success(`${contact.name} added to contract`);
  }

  function removeContact(id: string) {
    onChange({
      additionalContactIds: contract.additionalContactIds.filter((c) => c !== id),
    });
    setExtraContacts((prev) => prev.filter((c) => c.id !== id));
  }

  const primary = contract.contactSnapshot;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">
          Contacts{" "}
          <span className="ml-2 text-xs font-normal italic text-muted-foreground">
            Click on a contact for details or to change the primary
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <Star className="size-3.5 fill-current text-primary" />
            <span className="font-medium">
              {primary.name}
              {primary.companyName ? ` of ${primary.companyName}` : ""}
            </span>
          </div>
          {extraContacts.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
            >
              <span>{c.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => removeContact(c.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={<Button variant="outline" size="sm" className="h-7 text-xs" />}
          >
            + Add a Contact
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add a contact</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Search contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {results.map((c) => (
                <button
                  key={c.id}
                  className="flex w-full flex-col rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => addContact(c)}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.email ?? c.phone ?? ""}
                  </span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No contacts found
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
