import type { RestaurantSettings, ThemeSettings } from "@/types";
import { DEFAULT_THEME } from "@/types";
import { readStore, writeStore } from "./file-store";
import { DEFAULT_RESTAURANT_SETTINGS } from "./defaults";

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  const stored = await readStore<RestaurantSettings>(
    "restaurant-settings",
    DEFAULT_RESTAURANT_SETTINGS
  );
  // Older data files may predate newer settings sections — fill them in.
  return {
    ...DEFAULT_RESTAURANT_SETTINGS,
    ...stored,
    categories: stored.categories ?? DEFAULT_RESTAURANT_SETTINGS.categories,
    billingDetails:
      stored.billingDetails ?? DEFAULT_RESTAURANT_SETTINGS.billingDetails,
    docLayouts: stored.docLayouts ?? DEFAULT_RESTAURANT_SETTINGS.docLayouts,
  };
}

export async function saveRestaurantSettings(
  settings: RestaurantSettings
): Promise<RestaurantSettings> {
  await writeStore("restaurant-settings", settings);
  return settings;
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  const stored = await readStore<ThemeSettings>("theme-settings", DEFAULT_THEME);
  // older saved themes may predate newer color fields
  return { ...DEFAULT_THEME, ...stored };
}

export async function saveThemeSettings(
  theme: ThemeSettings
): Promise<ThemeSettings> {
  await writeStore("theme-settings", theme);
  return theme;
}
