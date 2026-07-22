import { getRestaurantSettings } from "@/lib/store/settings";
import { RestaurantSettingsView } from "@/components/settings/restaurant-settings-view";

export const metadata = { title: "Restaurant Settings | Event Manager" };

export default async function RestaurantSettingsPage() {
  const settings = await getRestaurantSettings();
  return <RestaurantSettingsView initialSettings={settings} />;
}
