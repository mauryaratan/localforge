import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter",
  description:
    "Convert colors between HEX, RGB, RGBA, HSL, HSLA, HSV, and CMYK formats. Check contrast ratios, explore color harmonies, and generate accessible color palettes. Privacy-first — runs entirely in your browser.",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl converter",
    "hsv converter",
    "cmyk converter",
    "color picker",
    "contrast checker",
    "color harmonies",
    "color palette",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Color Converter - LocalForge",
    description:
      "Convert colors between HEX, RGB, HSL, HSV, and CMYK. Check contrast ratios and explore harmonies.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Color Converter - LocalForge",
    description:
      "Convert colors between formats with contrast checking and harmony exploration.",
  },
};

const ColorConverterLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default ColorConverterLayout;
