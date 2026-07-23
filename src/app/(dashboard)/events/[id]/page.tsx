import { notFound } from "next/navigation";
import { getContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { ghlAppLinks } from "@/lib/ghl/client";
import { EventView } from "@/components/events/event-view";

export const metadata = { title: "Event | Event Manager" };

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contract, settings] = await Promise.all([
    getContract(id),
    getRestaurantSettings(),
  ]);
  if (!contract) notFound();

  return (
    <EventView
      initialContract={contract}
      settings={settings}
      ghlLinks={ghlAppLinks(contract.contactId)}
    />
  );
}
