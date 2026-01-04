import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/command-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

const berkeleyMono = localFont({
  src: "./BerkeleyMono-Regular.woff2",
});

const siteConfig = {
  name: "LocalForge",
  description:
    "Privacy-first developer utilities that run entirely in your browser. Format JSON, encode/decode Base64, parse URLs, generate UUIDs, and more — your data never leaves your device.",
  url: "https://localforge.app",
  author: "@mauryaratan",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Privacy-First Developer Utilities`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "developer tools",
    "localforge",
    "json formatter",
    "base64 encoder",
    "url parser",
    "uuid generator",
    "regex tester",
    "color converter",
    "cron parser",
    "offline tools",
    "privacy tools",
    "local-first",
    "pwa",
    "web tools",
  ],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — Privacy-First Developer Utilities`,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Privacy-First Developer Utilities`,
    description: siteConfig.description,
    creator: siteConfig.author,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${berkeleyMono.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 items-center gap-2 border-b px-4">
                <SidebarTrigger />
                <CommandMenu />
                <div className="ml-auto">
                  <ModeToggle />
                </div>
              </header>
              <main className="relative min-h-0 flex-1 p-4">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
