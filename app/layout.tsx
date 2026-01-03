import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body className={`${berkeleyMono.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
