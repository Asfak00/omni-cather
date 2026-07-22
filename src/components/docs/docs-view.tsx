"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Clock,
  ExternalLink,
  FileText,
  Link2,
  Mail,
  MoreHorizontal,
  Paperclip,
  Printer,
  Share2,
} from "lucide-react";
import type { Contract, EventDocument, RestaurantSettings } from "@/types";
import { contractTotals, currency, formatTime } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/contract/status-badge";

interface GHLLinks {
  contact: string;
  documents: string;
  invoices: string;
  conversations: string;
}

interface Props {
  contract: Contract;
  settings: RestaurantSettings;
  ghlLinks: GHLLinks;
}

export function DocsView({ contract, settings, ghlLinks }: Props) {
  const totals = contractTotals(contract);
  const areaNames = contract.areaIds
    .map((id) => settings.areas.find((a) => a.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  /** Share → GHL documents share page for this sub-account */
  function share(doc: EventDocument) {
    toast.info(`Opening GHL share page for “${doc.name}”...`);
    window.open(ghlLinks.documents, "_blank", "noopener");
  }

  /** Email → GHL conversation with the contract's contact */
  function email(doc: EventDocument) {
    toast.info(`Opening GHL email composer for “${doc.name}”...`);
    window.open(ghlLinks.conversations, "_blank", "noopener");
  }

  async function copyLink(doc: EventDocument) {
    const url = `${window.location.origin}/contracts/${contract.id}/docs?doc=${doc.id}`;
    await navigator.clipboard.writeText(url);
    toast.success("Document link copied to clipboard");
  }

  return (
    <div className="space-y-4">
      {/* event summary header */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-1.5 text-sm">
            <SummaryRow label="Event Name" value={contract.eventName} />
            <SummaryRow label="Booking" value={contract.bookingName} />
            <SummaryRow label="Event Id" value={contract.eventId} />
            <SummaryRow
              label="When"
              value={
                contract.date ? (
                  <span>
                    {format(new Date(`${contract.date}T00:00:00`), "EEE, MMM d, yyyy")}
                    <span className="ml-2 inline-flex items-center gap-1 text-muted-foreground">
                      <Clock className="size-3.5" />
                      {formatTime(contract.startTime)} to {formatTime(contract.endTime)}
                    </span>
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <SummaryRow label="Area(s)" value={areaNames || "—"} />
            <SummaryRow
              label="Status"
              value={<StatusBadge status={contract.status} />}
            />
          </div>
        </CardContent>
      </Card>

      {/* tabs strip (visual parity with GHL/Tripleseat) */}
      <Tabs value="docs">
        <TabsList>
          <TabsTrigger
            value="details"
            render={<Link href={`/contracts/${contract.id}`} />}
          >
            Details
          </TabsTrigger>
          <TabsTrigger value="docs">
            Docs{" "}
            <Badge className="ml-1 size-5 justify-center rounded-full p-0">
              {contract.documents.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">
                Contract &amp; Event Order: {contract.orderNumber}
              </h3>
              <p className="text-xs text-muted-foreground">
                Grand Total: {currency(totals.grandTotal)} &nbsp;·&nbsp; Amount
                Due: {currency(totals.estimatedAmountDue)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="size-4" /> Print
              </Button>
              <Button
                render={
                  <a href={ghlLinks.documents} target="_blank" rel="noopener" />
                }
                size="sm"
              >
                Add a document to this event
                <ExternalLink className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {contract.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{doc.name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Paperclip className="size-3" />
                    {doc.format}
                  </span>
                  {doc.status === "not_signed" && (
                    <Badge
                      variant="outline"
                      className="border-red-300 text-[10px] text-red-600"
                    >
                      ✎ Not Signed
                    </Badge>
                  )}
                  {doc.status === "signed" && (
                    <Badge className="bg-emerald-600 text-[10px]">Signed</Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {doc.shareable && (
                    <Button variant="outline" size="sm" onClick={() => share(doc)}>
                      <Share2 className="size-3.5" /> Share
                    </Button>
                  )}
                  {doc.linkable && (
                    <Button variant="outline" size="sm" onClick={() => copyLink(doc)}>
                      <Link2 className="size-3.5" /> Link
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-sm" />}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => email(doc)}>
                        <Mail className="size-4" /> Email via GHL
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => share(doc)}>
                        <Share2 className="size-4" /> Open GHL share page
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={
                          <a href={ghlLinks.contact} target="_blank" rel="noopener" />
                        }
                      >
                        <ExternalLink className="size-4" /> View contact in GHL
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-3">
      <span className="text-right text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
