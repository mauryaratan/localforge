import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
    <html lang="en">
      <body className={`${berkeleyMono.className}`}>{children}</body>
    </html>
  );
}
