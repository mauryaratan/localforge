import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASCII Art Generator",
  description:
    "Generate ASCII art from text and images directly in your browser. Multiple FIGlet-style fonts for text banners, customizable character sets for image conversion. Free online tool with real-time preview.",
  keywords: [
    "ascii art",
    "ascii art generator",
    "text to ascii",
    "image to ascii",
    "figlet",
    "text banner",
    "ascii converter",
    "ascii text",
    "text art generator",
    "character art",
    "monospace art",
    "terminal art",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "ASCII Art Generator - LocalForge",
    description:
      "Generate ASCII art from text and images. Multiple fonts, character sets, and color modes. Free with real-time preview.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ASCII Art Generator - LocalForge",
    description:
      "Transform text and images into ASCII art with customizable fonts and character sets.",
  },
};

const AsciiArtLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default AsciiArtLayout;
