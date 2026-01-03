import type { Metadata } from "next";
import { Geist_Mono, Hedvig_Letters_Sans } from "next/font/google";
import "./globals.css";

const hedvigSans = Hedvig_Letters_Sans({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hedvig-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      <body
        className={`${hedvigSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
