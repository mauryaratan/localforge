import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Viewer",
  description:
    "Compare text, code, JSON, YAML, and config files side by side with a privacy-first diff viewer that runs entirely in your browser.",
  keywords: [
    "diff viewer",
    "text compare",
    "code diff",
    "side by side diff",
    "unified diff",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Diff Viewer - LocalForge",
    description:
      "Compare text and code locally with split and unified diff views.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Diff Viewer - LocalForge",
    description: "Privacy-first text and code diff viewer",
  },
};

const DiffViewerLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default DiffViewerLayout;
