import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Encoder & Decoder",
  description:
    "Encode and decode URL components in real-time. Convert special characters to percent-encoded format and vice versa. Privacy-first — all processing happens locally in your browser.",
  keywords: [
    "url encoder",
    "url decoder",
    "percent encoding",
    "encodeURIComponent",
    "decodeURIComponent",
    "url escape",
    "url unescape",
    "query string encode",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "URL Encoder & Decoder - LocalForge",
    description:
      "Encode and decode URL components instantly. Convert special characters to percent-encoded format.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Encoder & Decoder - LocalForge",
    description:
      "Encode and decode URLs with real-time preview. Privacy-first.",
  },
};

const URLEncoderLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default URLEncoderLayout;
