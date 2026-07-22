import { ContractsList } from "@/components/contract/contracts-list";

export const metadata = { title: "Contracts | Event Manager" };

export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Contracts &amp; Events</h1>
        <p className="text-muted-foreground">
          Every contract created from a GHL contact, with its event details and
          documents.
        </p>
      </div>
      <ContractsList />
    </div>
  );
}
