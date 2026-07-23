import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ExternalLink, Link2 } from "lucide-react";
import { getContact } from "@/lib/ghl/contacts";
import { listContracts, saveContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { createContractFromContact } from "@/lib/contract-factory";
import { ghlAppLinks } from "@/lib/ghl/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Make Contract | Event Manager" };

/**
 * Entry point opened FROM OmniCather.
 *
 * Contacts live in the OmniCather contact list — a "Make Contract"
 * custom link there opens this page with the contact id. We create
 * (or reuse) a draft contract for that contact and drop the user
 * straight into the contract editor.
 *
 *   /make-contract?contactId=<contact id>
 */
export default async function MakeContractPage({
  searchParams,
}: {
  searchParams: Promise<{ contactId?: string }>;
}) {
  const { contactId } = await searchParams;

  if (contactId) {
    const contact = await getContact(contactId);

    if (contact) {
      // Reuse an open draft for this contact so the button is idempotent
      const existing = (await listContracts()).find(
        (c) => c.contactId === contactId && c.status === "PROSPECT"
      );
      if (existing) redirect(`/contracts/${existing.id}`);

      const settings = await getRestaurantSettings();
      const contract = await saveContract(
        createContractFromContact(contact, settings)
      );
      redirect(`/contracts/${contract.id}`);
    }
  }

  // No (valid) contactId → show how to hook this page up in OmniCather
  const links = ghlAppLinks();

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-10">
      <div>
        <h1>Make Contract</h1>
        <p className="text-muted-foreground">
          {contactId
            ? `Contact “${contactId}” was not found — check the link and try again.`
            : "This page is opened from OmniCather with a contact attached."}
        </p>
      </div>

      {contactId && (
        <Badge variant="outline" className="border-(--danger)/40 text-(--danger)">
          Contact not found
        </Badge>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Contacts stay in OmniCather — this app takes over from “Make
            Contract” onwards.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal space-y-3 pl-5">
            <li>
              A reservation form submission creates a contact in your OmniCather sub-account, as usual.
            </li>
            <li>
              In OmniCather, add a <strong>“Make Contract”</strong> link for
              contacts (Custom Menu Link, workflow SMS/email button, or a
              custom field button) pointing to:
              <code className="mt-2 block rounded-md bg-muted px-3 py-2 font-mono text-xs">
                {"https://<your-app-domain>/make-contract?contactId={{contact.id}}"}
              </code>
              OmniCather replaces{" "}
              <code className="rounded bg-muted px-1">{"{{contact.id}}"}</code>{" "}
              with the real contact id when the link is clicked.
            </li>
            <li>
              Clicking it lands here — a draft contract is created for that
              contact automatically and the contract editor opens with
              everything pre-filled.
            </li>
            <li>
              Finish the contract (menus, taxes, billing), then share the
              generated documents back through OmniCather.
            </li>
          </ol>

          <div className="flex flex-wrap gap-3 border-t pt-4">
            <a
              href={links.contact}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-primary underline"
            >
              <ExternalLink className="size-4" /> Open OmniCather contacts
            </a>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 text-primary underline"
            >
              <ArrowRight className="size-4" /> Go to events
            </Link>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Link2 className="size-4" /> Test locally:{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">
                /make-contract?contactId=mock-kirby
              </code>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
