import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Code Generator & Reader",
  description:
    "Generate QR codes from URLs, text, WiFi credentials, emails, and phone numbers. Read and decode QR codes from images. Privacy-first — runs entirely in your browser.",
  keywords: [
    "qr code",
    "qr code generator",
    "qr code reader",
    "qr code scanner",
    "qr code decoder",
    "wifi qr code",
    "url qr code",
    "vcard qr code",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "QR Code Generator & Reader - LocalForge",
    description:
      "Generate and decode QR codes. Supports URLs, WiFi, email, phone, and custom text.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "QR Code Generator & Reader - LocalForge",
    description: "Generate and decode QR codes with custom colors and settings",
  },
};

const QRCodeLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default QRCodeLayout;
