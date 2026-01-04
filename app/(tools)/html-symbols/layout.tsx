import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Symbols Reference",
  description:
    "Browse and copy HTML symbols, entities, and character codes. Find Unicode values, hex codes, HTML entities, and CSS codes for arrows, currency, math, Greek letters, and more.",
  keywords: [
    "html symbols",
    "html entities",
    "html character codes",
    "unicode characters",
    "html arrows",
    "html currency symbols",
    "html math symbols",
    "greek letters html",
    "html special characters",
    "unicode",
    "hex code",
    "css code",
    "html entity reference",
    "character entity reference",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "HTML Symbols - LocalForge",
    description:
      "Browse and copy HTML symbols, entities, and character codes with Unicode, hex, and CSS values.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Symbols - LocalForge",
    description:
      "Find and copy HTML symbols, entities, Unicode values, and CSS codes",
  },
};

const HTMLSymbolsLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default HTMLSymbolsLayout;
