import { notFound } from "next/navigation";
import { getContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { ghlAppLinks } from "@/lib/ghl/client";
import { fetchGhlNotes, syncContactSnapshot } from "@/lib/ghl/sync";
import { EventView } from "@/components/events/event-view";

export const metadata = { title: "Event | Event Manager" };

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [stored, settings] = await Promise.all([
    getContract(id),
    getRestaurantSettings(),
  ]);
  if (!stored) notFound();

  // Live-sync: refresh the contact from GHL on every load, and pull
  // the contact's GHL notes into the event log (no-ops in demo mode).
  const [contract, ghlNotes] = await Promise.all([
    syncContactSnapshot(stored),
    fetchGhlNotes(stored.contactId),
  ]);

  return (
    <EventView
      initialContract={contract}
      settings={settings}
      ghlLinks={ghlAppLinks(contract.contactId)}
      ghlNotes={ghlNotes}
    />
  );
}
