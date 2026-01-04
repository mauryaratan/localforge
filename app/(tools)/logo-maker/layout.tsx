import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logo Maker - Create Custom SVG & PNG Logos",
  description:
    "Create beautiful, customizable logos with icons, shapes, and text. Customize size, rotation, colors, borders, backgrounds, shadows, and export as SVG or PNG in multiple sizes.",
  keywords: [
    "logo maker",
    "logo generator",
    "icon maker",
    "svg logo",
    "png logo",
    "logo creator",
    "icon generator",
    "logo design",
    "brand logo",
    "app icon",
    "favicon generator",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Logo Maker - Create Custom SVG & PNG Logos - LocalForge",
    description:
      "Create customizable logos with icons and shapes. Export as SVG or PNG in multiple sizes.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Logo Maker - LocalForge",
    description:
      "Create beautiful logos with customizable icons, backgrounds, and shadows. Export as SVG or PNG.",
  },
};

const LogoMakerLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default LogoMakerLayout;
