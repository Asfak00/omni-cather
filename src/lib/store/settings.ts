import type { RestaurantSettings, ThemeSettings } from "@/types";
import { DEFAULT_THEME } from "@/types";
import { readStore, writeStore } from "./file-store";
import { DEFAULT_RESTAURANT_SETTINGS } from "./defaults";

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  return readStore<RestaurantSettings>(
    "restaurant-settings",
    DEFAULT_RESTAURANT_SETTINGS
  );
}

export async function saveRestaurantSettings(
  settings: RestaurantSettings
): Promise<RestaurantSettings> {
  await writeStore("restaurant-settings", settings);
  return settings;
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  return readStore<ThemeSettings>("theme-settings", DEFAULT_THEME);
}

export async function saveThemeSettings(
  theme: ThemeSettings
): Promise<ThemeSettings> {
  await writeStore("theme-settings", theme);
  return theme;
}
