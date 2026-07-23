"use client";

import * as React from "react";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import type { Contract, DiscussionMessage, RestaurantSettings } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function randomId() {
  return `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

interface Props {
  contract: Contract;
  settings: RestaurantSettings;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
}

export function DiscussionTab({ contract, settings, onPatch }: Props) {
  const [channel, setChannel] = React.useState<"guest" | "staff">("guest");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");

  const owner = settings.owners.find((o) => o.id === contract.ownerId);
  const messages = (contract.messages ?? []).filter(
    (m) =>
      m.channel === channel &&
      (!query.trim() ||
        `${m.subject} ${m.body}`.toLowerCase().includes(query.toLowerCase()))
  );

  async function send() {
    const message: DiscussionMessage = {
      id: randomId(),
      channel,
      subject: subject || "(no subject)",
      body,
      author: owner?.name ?? "Sub-account user",
      at: new Date().toISOString(),
    };
    await onPatch({ messages: [...(contract.messages ?? []), message] });
    setOpen(false);
    setSubject("");
    setBody("");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border p-1">
            {(["guest", "staff"] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium capitalize",
                  channel === ch
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {ch}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> New{" "}
            {channel === "guest" ? "Guest" : "Staff"} Message
          </Button>
        </div>

        <div className="relative mb-3 max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`Search ${channel} discussions`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No {channel} messages yet.
          </p>
        ) : (
          <div className="divide-y rounded-md border">
            {[...messages].reverse().map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
              >
                <Badge
                  variant="outline"
                  className="border-amber-300 text-[10px] capitalize text-amber-700"
                >
                  {m.channel}
                </Badge>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium">{m.subject}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    - {m.body.slice(0, 80)}
                    {m.body.length > 80 && "..."}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{m.author}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(m.at), "MMM d")}
                </span>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                New {channel === "guest" ? "Guest" : "Staff"} Message
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Subject</Label>
                <Input
                  className="mt-1"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={`Contract for ${contract.eventName}`}
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  className="mt-1"
                  rows={5}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hello, we are thrilled to be hosting your event..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={send} disabled={!body.trim()}>
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
