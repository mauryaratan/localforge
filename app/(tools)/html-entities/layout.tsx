import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Entity Encoder / Decoder - DevTools",
  description:
    "Convert special characters to HTML entities and back. Supports named entities (&amp;), decimal (&#38;), and hexadecimal (&#x26;) formats. Essential for web development and HTML encoding.",
  keywords: [
    "html entities",
    "html encoder",
    "html decoder",
    "html entity encoder",
    "html entity decoder",
    "special characters",
    "html escape",
    "html unescape",
    "character encoding",
    "html special characters",
    "amp",
    "lt",
    "gt",
    "quot",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "HTML Entity Encoder / Decoder - DevTools",
    description:
      "Convert special characters to HTML entities and back. Supports named, decimal, and hexadecimal formats.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Entity Encoder / Decoder - DevTools",
    description:
      "Encode and decode HTML entities in real-time with multiple format support",
  },
};

const HTMLEntitiesLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default HTMLEntitiesLayout;
