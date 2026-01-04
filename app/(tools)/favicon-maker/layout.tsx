import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Favicon Maker - Generate Favicons for All Devices",
  description:
    "Generate favicons for all devices and platforms. Upload your logo and get favicon.ico, Apple Touch Icon, Android Chrome icons, and PNG favicons in all sizes. Download as ZIP with ready-to-use HTML code.",
  keywords: [
    "favicon generator",
    "favicon maker",
    "favicon ico",
    "apple touch icon",
    "android chrome icon",
    "pwa icons",
    "favicon converter",
    "favicon creator",
    "site icon generator",
    "browser icon",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Favicon Maker - Generate Favicons for All Devices - LocalForge",
    description:
      "Upload your logo and generate favicons for all platforms: ICO, Apple Touch Icon, Android Chrome, and PNG in all sizes.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Favicon Maker - LocalForge",
    description:
      "Generate favicons for all devices from a single image. Download as ZIP with HTML code.",
  },
};

const FaviconMakerLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default FaviconMakerLayout;
