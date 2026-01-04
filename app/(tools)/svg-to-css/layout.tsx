import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG to CSS Converter",
  description:
    "Convert SVG code to CSS data URI for use as background-image, mask-image, or list bullets. Supports URL encoding and Base64. Privacy-first — all processing happens in your browser.",
  keywords: [
    "svg to css",
    "svg data uri",
    "svg background image",
    "svg to base64",
    "css background svg",
    "svg url encoder",
    "inline svg css",
    "svg mask image",
    "data uri generator",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "SVG to CSS Converter - LocalForge",
    description:
      "Convert SVG to CSS data URI for backgrounds, masks, and list bullets. URL encoding or Base64 supported.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SVG to CSS Converter - LocalForge",
    description:
      "Convert SVG to CSS data URI instantly. Privacy-first, works offline.",
  },
};

const SvgToCssLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default SvgToCssLayout;
