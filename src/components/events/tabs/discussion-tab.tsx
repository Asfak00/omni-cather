"use client";

import * as React from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  Folder,
  Paperclip,
  Plus,
  Search,
  Send,
  Star,
  Users,
  X,
} from "lucide-react";
import type { Contract, DiscussionMessage, RestaurantSettings } from "@/types";
import { DOC_META, docPdfUrl } from "@/lib/docs";
import type { DocName } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { cn } from "@/lib/utils";

function randomId() {
  return `msg_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** normalize a subject so replies join the original thread */
const threadKey = (subject: string) =>
  subject.replace(/^(re:\s*)+/i, "").trim().toLowerCase();

type SubTab = "guest" | "staff" | "pending" | "drafts";

interface Props {
  contract: Contract;
  settings: RestaurantSettings;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
}

export function DiscussionTab({ contract, settings, onPatch }: Props) {
  const [subTab, setSubTab] = React.useState<SubTab>("guest");
  const [query, setQuery] = React.useState("");
  /** thread being viewed; null = list, "new" = fresh composer */
  const [openThread, setOpenThread] = React.useState<string | null>(null);

  const owner = settings.owners.find((o) => o.id === contract.ownerId);
  const messages = contract.messages ?? [];

  const visible = messages.filter((m) => {
    if (subTab === "drafts") return m.draft;
    if (subTab === "pending") return false;
    if (m.draft) return false;
    if (m.channel !== subTab) return false;
    if (
      query.trim() &&
      !`${m.subject} ${m.body}`.toLowerCase().includes(query.toLowerCase())
    )
      return false;
    return true;
  });

  // newest message per thread for the list view
  const threads = new Map<string, DiscussionMessage>();
  for (const m of visible) threads.set(threadKey(m.subject), m);

  const defaultSubject = `Contract for ${contract.eventName}${
    contract.date
      ? ` on ${format(new Date(`${contract.date}T00:00:00`), "MMMM d, yyyy")}`
      : ""
  } at ${settings.venueName}`;

  return (
    <Card>
      <CardContent className="pt-6">
        {/* sub-tab strip + new message */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex rounded-lg border p-1">
            {(["guest", "staff", "pending", "drafts"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setSubTab(t);
                  setOpenThread(null);
                }}
                className={cn(
                  "rounded-md px-4 py-1.5 text-sm font-medium capitalize",
                  subTab === t
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setOpenThread("new")}>
            <Plus className="size-4" /> New{" "}
            {subTab === "staff" ? "Staff" : "Guest"} Message
          </Button>
        </div>

        {openThread ? (
          <ThreadView
            contract={contract}
            ownerName={owner?.name ?? "Sub-account user"}
            channel={subTab === "staff" ? "staff" : "guest"}
            threadId={openThread === "new" ? null : openThread}
            defaultSubject={defaultSubject}
            onBack={() => setOpenThread(null)}
            onPatch={onPatch}
          />
        ) : (
          <>
            <div className="relative mb-3 max-w-xs">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={`Search ${subTab} discussions`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {threads.size === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No {subTab} messages yet.
              </p>
            ) : (
              <div className="divide-y rounded-md border">
                {[...threads.values()].reverse().map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setOpenThread(threadKey(m.subject))}
                    className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                  >
                    <Star className="size-4 text-muted-foreground/40" />
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-[10px] capitalize text-amber-700"
                    >
                      {m.draft ? "draft" : m.channel}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium">{m.subject}</span>
                      <span
                        className="ml-2 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: `- ${m.body.replace(/<[^>]+>/g, " ").slice(0, 80)}...`,
                        }}
                      />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {m.author}, {contract.contactSnapshot.firstName}...
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(m.at), "MMM d")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------------- thread view + composer ---------------- */

function ThreadView({
  contract,
  ownerName,
  channel,
  threadId,
  defaultSubject,
  onBack,
  onPatch,
}: {
  contract: Contract;
  ownerName: string;
  channel: "guest" | "staff";
  threadId: string | null;
  defaultSubject: string;
  onBack: () => void;
  onPatch: (patch: Partial<Contract>) => Promise<void>;
}) {
  const messages = (contract.messages ?? []).filter(
    (m) => threadId && threadKey(m.subject) === threadId && !m.draft
  );
  const rootSubject = messages[0]?.subject ?? defaultSubject;

  const [subject, setSubject] = React.useState(
    messages.length ? `Re: ${rootSubject.replace(/^(re:\s*)+/i, "")}` : defaultSubject
  );
  const [body, setBody] = React.useState("");
  const [sharedDocs, setSharedDocs] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);

  async function submit(draft: boolean) {
    if (!body.trim() && !draft) return;
    setSending(true);
    const message: DiscussionMessage = {
      id: randomId(),
      channel,
      subject: subject || rootSubject,
      body,
      author: ownerName,
      at: new Date().toISOString(),
      draft,
      viewed: false,
      sharedDocs: sharedDocs.length ? sharedDocs : undefined,
    };
    await onPatch({ messages: [...(contract.messages ?? []), message] });

    // Relay guest messages through the GHL conversations API
    let relayed = false;
    if (!draft && channel === "guest") {
      const res = await fetch("/api/ghl/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          subject: message.subject,
          html: body,
        }),
      }).catch(() => null);
      relayed = Boolean(res?.ok && (await res.json().catch(() => null))?.relayed);
    }

    setSending(false);
    if (draft) {
      toast.success("Draft saved");
    } else if (channel === "guest") {
      toast.success(
        relayed
          ? "Message sent via Omni Cather conversation"
          : "Message saved — will relay via Omni Cather once credentials are connected"
      );
    } else {
      toast.success("Staff message posted");
    }
    setBody("");
    if (!threadId) onBack();
  }

  return (
    <div className="space-y-4">
      {/* thread header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={onBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <span className="font-medium">
          Contract Discussion: {contract.orderNumber}
        </span>
        <Badge
          variant="outline"
          className="border-amber-300 text-[10px] capitalize text-amber-700"
        >
          {channel}
        </Badge>
        <Star className="ml-auto size-4 text-muted-foreground/40" />
      </div>

      {messages.length > 0 && (
        <p className="border-b pb-2 text-sm font-medium">{rootSubject}</p>
      )}

      {/* messages */}
      {messages.map((m) => (
        <div key={m.id} className="rounded-md border">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials(m.author)}
              </AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{m.author}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(m.at), "EEE, MMM d, yyyy '@' h:mm a")}
              </p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              {m.viewed && (
                <>
                  <Check className="size-3.5 text-primary" /> viewed
                </>
              )}
            </span>
          </div>
          <div
            className="px-4 py-3 text-sm [&_a]:text-primary [&_a]:underline"
            dangerouslySetInnerHTML={{ __html: m.body }}
          />
          {m.sharedDocs && m.sharedDocs.length > 0 && (
            <div className="mx-4 mb-4 rounded-md border px-4 py-3">
              <p className="mb-1 text-sm font-semibold">Shared Documents:</p>
              {m.sharedDocs.map((doc) => (
                <a
                  key={doc}
                  href={docPdfUrl(contract.id, doc as DocName)}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <FileText className="size-3.5" /> {doc}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* composer */}
      <div className="rounded-md border">
        <div className="flex items-center gap-3 border-b px-4 py-2.5">
          <span className="w-14 text-sm font-semibold">To</span>
          {channel === "guest" ? (
            <span className="flex items-center gap-1 rounded-md border bg-muted/40 py-1 pl-3 pr-2 text-sm">
              {contract.contactSnapshot.name}
              <Badge className="bg-teal-200 text-[9px] uppercase text-teal-900">
                Contact
              </Badge>
              <X className="size-3.5 cursor-pointer text-muted-foreground" />
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              All staff members
            </span>
          )}
          <X className="ml-auto size-4 cursor-pointer text-muted-foreground" onClick={onBack} />
        </div>
        <div className="flex items-center gap-3 border-b px-4 py-2.5">
          <span className="w-14 text-sm font-semibold">Subject</span>
          <input
            className="flex-1 bg-transparent text-sm outline-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="p-3">
          <RichTextEditor
            rows={5}
            value={body}
            onChange={setBody}
            placeholder="Write your message..."
          />
        </div>

        {sharedDocs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              Sharing:
            </span>
            {sharedDocs.map((doc) => (
              <Badge key={doc} variant="secondary" className="gap-1">
                <FileText className="size-3" /> {doc}
                <X
                  className="size-3 cursor-pointer"
                  onClick={() =>
                    setSharedDocs((prev) => prev.filter((d) => d !== doc))
                  }
                />
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5">
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={() => toast.info("Attach files from the event's Attached Files panel")}>
              <Paperclip className="size-3.5" /> Attachments
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info("File library coming from Omni Cather media storage")}>
              <Folder className="size-3.5" /> File Library
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                <FileText className="size-3.5" /> Documents{" "}
                <ChevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {(Object.keys(DOC_META) as DocName[]).map((doc) => (
                  <DropdownMenuItem
                    key={doc}
                    onClick={() =>
                      setSharedDocs((prev) =>
                        prev.includes(doc) ? prev : [...prev, doc]
                      )
                    }
                  >
                    <FileText className="size-4" /> {doc}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={sending}
              onClick={() => submit(true)}
            >
              Save Draft
            </Button>
            <Button size="sm" disabled={sending || !body.trim()} onClick={() => submit(false)}>
              <Send className="size-3.5" /> Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
