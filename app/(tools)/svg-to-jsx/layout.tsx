import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG to JSX Converter",
  description:
    "Convert SVG code to JSX for React components. Transforms attributes to camelCase, class to className, and inline styles to JSX objects. Supports TypeScript, React.memo, and spread props. Privacy-first — all processing happens in your browser.",
  keywords: [
    "svg to jsx",
    "svg to react",
    "svg react component",
    "convert svg jsx",
    "svg to tsx",
    "svg typescript",
    "react svg component",
    "svg converter",
    "jsx converter",
    "svg attributes camelcase",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "SVG to JSX Converter - LocalForge",
    description:
      "Convert SVG to JSX for React. Transforms attributes, supports TypeScript, React.memo, and spread props.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SVG to JSX Converter - LocalForge",
    description:
      "Convert SVG to JSX instantly. Privacy-first, works offline.",
  },
};

const SvgToJsxLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default SvgToJsxLayout;
