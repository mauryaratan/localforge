import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64 Encoder & Decoder",
  description:
    "Encode text to Base64 or decode Base64 strings in real-time. Supports standard Base64 and URL-safe Base64 (Base64URL). Privacy-first — runs entirely in your browser.",
  keywords: [
    "base64",
    "base64 encoder",
    "base64 decoder",
    "base64url",
    "url-safe base64",
    "encode",
    "decode",
    "text to base64",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Base64 Encoder & Decoder - LocalForge",
    description:
      "Encode and decode Base64 strings in real-time. Supports standard and URL-safe variants.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Base64 Encoder & Decoder - LocalForge",
    description: "Encode and decode Base64 strings with URL-safe support",
  },
};

const Base64Layout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default Base64Layout;
