import { notFound } from "next/navigation";
import { getContract, listContracts } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { EventEditForm } from "@/components/events/event-edit-form";

export const metadata = { title: "Edit Event | Event Manager" };

export default async function EventEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [contract, settings, allContracts] = await Promise.all([
    getContract(id),
    getRestaurantSettings(),
    listContracts(),
  ]);
  if (!contract) notFound();

  return (
    <EventEditForm
      initialContract={contract}
      settings={settings}
      allContracts={allContracts}
    />
  );
}
