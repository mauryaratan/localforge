import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Color Converter | DevTools",
  description:
    "Convert colors between HEX, RGB, RGBA, HSL, HSLA, HSV, and CMYK formats. Check contrast ratios and explore color harmonies.",
};

export default function ColorConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
