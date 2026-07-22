import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getThemeSettings } from "@/lib/store/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event Manager | GHL",
  description:
    "Manage reservations, contracts, menus and documents on top of GoHighLevel",
};

// Theme + restaurant settings live in a mutable store; every page must
// render with the latest values rather than build-time snapshots.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings();

  // Inline the saved theme variables so there is no flash of
  // default styling before the client ThemeProvider hydrates.
  const themeCss = `:root{
    --primary:${theme.primaryColor};
    --accent:${theme.accentColor};
    --background:${theme.backgroundColor};
    --foreground:${theme.foregroundColor};
    --card:${theme.cardColor};
    --card-foreground:${theme.foregroundColor};
    --radius:${theme.radius}rem;
    --app-font-body:${theme.bodyFont};
    --app-font-heading:${theme.headingFont};
    --app-h1:${theme.h1Size}px;
    --app-h2:${theme.h2Size}px;
    --app-h3:${theme.h3Size}px;
    --app-h4:${theme.h4Size}px;
    --app-p:${theme.paragraphSize}px;
    --app-small:${theme.smallSize}px;
    --app-heading-weight:${theme.headingWeight};
  }`;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider initialTheme={theme}>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
