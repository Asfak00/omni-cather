import { notFound } from "next/navigation";
import { getContract } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { ghlAppLinks } from "@/lib/ghl/client";
import { ContractEditor } from "@/components/contract/contract-editor";

export const metadata = { title: "Edit Contract | Event Manager" };

export default async function ContractPage({
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
    <ContractEditor
      initialContract={contract}
      settings={settings}
      ghlContactUrl={ghlAppLinks(contract.contactId).contact}
    />
  );
}
