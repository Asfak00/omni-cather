import { notFound } from "next/navigation";
import { getContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { ghlAppLinks } from "@/lib/ghl/client";
import { DocsView } from "@/components/docs/docs-view";

export const metadata = { title: "Documents | Event Manager" };

export default async function DocsPage({
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

  const ghlLinks = ghlAppLinks(contract.contactId);

  return (
    <DocsView contract={contract} settings={settings} ghlLinks={ghlLinks} />
  );
}
