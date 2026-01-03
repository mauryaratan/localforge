import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandMenu } from "@/components/command-menu";
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

export const metadata: Metadata = {
  title: "DevTools",
  description: "A developer tools application",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DevTools",
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
              </header>
              <main className="flex-1 p-4">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
