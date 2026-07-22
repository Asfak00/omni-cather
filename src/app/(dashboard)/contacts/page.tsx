import { ContactsTable } from "@/components/contacts/contacts-table";

export const metadata = { title: "Contacts | Event Manager" };

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Contacts</h1>
        <p className="text-muted-foreground">
          Reservations land here from your GHL form. Select a contact to start a
          contract.
        </p>
      </div>
      <ContactsTable />
    </div>
  );
}
