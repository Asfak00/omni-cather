"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Link2,
  Mail,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Printer,
  Settings,
  Share2,
  Trash2,
} from "lucide-react";
import type { Contract, ContractTotals, EventDocument } from "@/types";
import { currency } from "@/lib/calculations";
import { DOC_META, docPdfUrl } from "@/lib/docs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GHLLinks {
  contact: string;
  documents: string;
  invoices: string;
  conversations: string;
}

interface Props {
  contract: Contract;
  totals: ContractTotals;
  ghlLinks: GHLLinks;
  onDeleted: () => void;
}

export function DocsTab({ contract, totals, ghlLinks, onDeleted }: Props) {
  const router = useRouter();

  function share(doc: EventDocument) {
    toast.info(`Opening Omni Cather share page for “${doc.name}”...`);
    window.open(ghlLinks.documents, "_blank", "noopener");
  }

  function email(doc: EventDocument) {
    toast.info(`Opening Omni Cather email composer for “${doc.name}”...`);
    window.open(ghlLinks.conversations, "_blank", "noopener");
  }

  async function copyLink(doc: EventDocument) {
    const url = `${window.location.origin}${docPdfUrl(contract.id, doc.name)}`;
    await navigator.clipboard.writeText(url);
    toast.success("Document link copied to clipboard");
  }

  async function copyContract() {
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duplicateOf: contract.id }),
    });
    if (res.ok) {
      const data = await res.json();
      toast.success("Contract copied");
      router.push(`/events/${data.contract.id}`);
    } else toast.error("Failed to copy");
  }

  async function deleteContract() {
    if (!window.confirm("Delete this contract and its event?")) return;
    const res = await fetch(`/api/contracts/${contract.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Contract deleted");
      onDeleted();
    } else toast.error("Failed to delete");
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(docPdfUrl(contract.id, "Contract"), "_blank", "noopener")
            }
          >
            <Printer className="size-4" /> Print
          </Button>
          <Button
            render={<a href={ghlLinks.documents} target="_blank" rel="noopener" />}
            size="sm"
          >
            Add a document to this event <ChevronDown className="size-3.5" />
          </Button>
        </div>

        {/* Contract & Event Order header — click to open the contract editor */}
        <div className="flex items-center justify-between rounded-t-md border bg-muted/30 px-4 py-3">
          <div>
            <Link
              href={`/contracts/${contract.id}`}
              className="font-semibold text-primary hover:underline"
            >
              Contract &amp; Event Order: {contract.orderNumber}
            </Link>
            <p className="text-xs text-muted-foreground">
              Grand Total: {currency(totals.grandTotal)} &nbsp;&nbsp; Amount Due:{" "}
              {currency(totals.remaining)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button size="sm" />}>
              <Settings className="size-3.5" />
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/contracts/${contract.id}`} />}>
                <Pencil className="size-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyContract}>
                <Copy className="size-4" /> Copy
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(
                    docPdfUrl(contract.id, "Contract"),
                    "_blank",
                    "noopener"
                  )
                }
              >
                <Printer className="size-4" /> Print
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={deleteContract}>
                <Trash2 className="size-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="divide-y rounded-b-md border border-t-0 px-4">
          {contract.documents.map((doc) => {
            const meta = DOC_META[doc.name];
            const pdfUrl = docPdfUrl(contract.id, doc.name);
            return (
              <div
                key={doc.id}
                className="flex flex-wrap items-center justify-between gap-2 py-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{doc.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Paperclip className="size-3" />
                      {doc.format}
                    </span>
                    <Badge variant="secondary" className="text-[10px] uppercase">
                      {doc.audience ?? meta.audience}
                    </Badge>
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
                  <p className="ml-6 mt-0.5 text-xs text-muted-foreground">
                    {meta.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    render={<a href={pdfUrl} target="_blank" rel="noopener" />}
                    variant="secondary"
                    size="sm"
                  >
                    <Eye className="size-3.5" /> View PDF
                  </Button>
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
                      <DropdownMenuItem render={<a href={`${pdfUrl}?download=1`} />}>
                        <Download className="size-4" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => email(doc)}>
                        <Mail className="size-4" /> Email via Omni Cather
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => share(doc)}>
                        <Share2 className="size-4" /> Open Omni Cather share page
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={
                          <a href={ghlLinks.contact} target="_blank" rel="noopener" />
                        }
                      >
                        <ExternalLink className="size-4" /> View contact in Omni Cather
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
