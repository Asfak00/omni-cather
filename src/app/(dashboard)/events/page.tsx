import { listContracts } from "@/lib/store/contracts";
import { getRestaurantSettings } from "@/lib/store/settings";
import { EventsList } from "@/components/events/events-list";

export const metadata = { title: "Events | Event Manager" };

export default async function EventsPage() {
  const [contracts, settings] = await Promise.all([
    listContracts(),
    getRestaurantSettings(),
  ]);

  return (
    <div className="space-y-6">
      <h1>Events</h1>
      <EventsList contracts={contracts} settings={settings} />
    </div>
  );
}
