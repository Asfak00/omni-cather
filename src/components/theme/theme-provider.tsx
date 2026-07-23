"use client";

import * as React from "react";
import type { ThemeSettings } from "@/types";
import { DEFAULT_THEME } from "@/types";

/* ------------------------------------------------------------
 * ThemeProvider — applies the user-configurable theme (colors,
 * fonts, heading / paragraph sizes) as CSS variables on <html>.
 * The theme editor mutates the context for live preview and
 * persists via PUT /api/settings/theme.
 * ------------------------------------------------------------ */

interface ThemeContextValue {
  theme: ThemeSettings;
  setTheme: (theme: ThemeSettings) => void;
  saveTheme: (theme: ThemeSettings) => Promise<void>;
  resetTheme: () => Promise<void>;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function useThemeSettings() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeSettings must be used within ThemeProvider");
  return ctx;
}

/** Relative luminance → pick black or white text on a colored bg */
function contrastForeground(hex: string): string {
  const m = hex.replace("#", "");
  if (m.length < 6) return "#ffffff";
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.55 ? "#111111" : "#ffffff";
}

export function applyThemeVars(theme: ThemeSettings, el: HTMLElement) {
  const vars: Record<string, string> = {
    "--primary": theme.primaryColor,
    "--primary-foreground": contrastForeground(theme.primaryColor),
    "--accent": theme.accentColor,
    "--accent-foreground": contrastForeground(theme.accentColor),
    "--background": theme.backgroundColor,
    "--foreground": theme.foregroundColor,
    "--card": theme.cardColor,
    "--card-foreground": theme.foregroundColor,
    "--popover": theme.cardColor,
    "--popover-foreground": theme.foregroundColor,
    "--sidebar-primary": theme.primaryColor,
    "--sidebar-primary-foreground": contrastForeground(theme.primaryColor),
    "--ring": theme.primaryColor,
    "--destructive": theme.dangerColor,
    "--success": theme.successColor,
    "--danger": theme.dangerColor,
    "--warning": theme.warningColor,
    "--info": theme.infoColor,
    "--status-prospect": theme.statusProspect,
    "--status-tentative": theme.statusTentative,
    "--status-definite": theme.statusDefinite,
    "--status-closed": theme.statusClosed,
    "--status-lost": theme.statusLost,
    "--radius": `${theme.radius}rem`,
    "--app-font-body": theme.bodyFont,
    "--app-font-heading": theme.headingFont,
    "--app-h1": `${theme.h1Size}px`,
    "--app-h2": `${theme.h2Size}px`,
    "--app-h3": `${theme.h3Size}px`,
    "--app-h4": `${theme.h4Size}px`,
    "--app-p": `${theme.paragraphSize}px`,
    "--app-small": `${theme.smallSize}px`,
    "--app-heading-weight": String(theme.headingWeight),
  };
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: ThemeSettings;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<ThemeSettings>(initialTheme);

  React.useEffect(() => {
    applyThemeVars(theme, document.documentElement);
  }, [theme]);

  const setTheme = React.useCallback((t: ThemeSettings) => setThemeState(t), []);

  const saveTheme = React.useCallback(async (t: ThemeSettings) => {
    setThemeState(t);
    const res = await fetch("/api/settings/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(t),
    });
    if (!res.ok) throw new Error("Failed to save theme");
  }, []);

  const resetTheme = React.useCallback(async () => {
    await saveTheme(DEFAULT_THEME);
  }, [saveTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, saveTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
