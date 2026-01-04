import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown Preview",
  description:
    "Write and preview Markdown with live rendering. Features GitHub Flavored Markdown (GFM) support, tables, task lists, syntax highlighting, and document statistics.",
  keywords: [
    "markdown",
    "markdown preview",
    "markdown editor",
    "markdown viewer",
    "gfm",
    "github flavored markdown",
    "markdown tables",
    "markdown syntax",
    "live preview",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Markdown Preview - LocalForge",
    description:
      "Write and preview Markdown with live rendering. GFM support, tables, task lists, and document statistics.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Markdown Preview - LocalForge",
    description:
      "Write and preview Markdown with live rendering and GFM support",
  },
};

const MarkdownPreviewLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default MarkdownPreviewLayout;
