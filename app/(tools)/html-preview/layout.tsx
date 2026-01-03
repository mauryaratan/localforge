import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Preview - DevTools",
  description:
    "Live HTML preview tool with responsive viewport testing. Render HTML, CSS, and JavaScript instantly with mobile, tablet, and desktop views. Secure sandboxed environment with light/dark mode support.",
  keywords: [
    "html preview",
    "html viewer",
    "html renderer",
    "html editor",
    "live preview",
    "responsive preview",
    "html sandbox",
    "html tester",
    "web preview",
    "css preview",
    "javascript preview",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "HTML Preview - DevTools",
    description:
      "Live HTML preview with responsive viewport testing. Render HTML, CSS, and JavaScript instantly in a secure sandbox.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "HTML Preview - DevTools",
    description:
      "Live HTML preview with responsive viewport testing and secure sandbox",
  },
};

const HtmlPreviewLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default HtmlPreviewLayout;
