import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Markdown Converter",
  description:
    "Convert text-based PDFs into structured Markdown locally in your browser. Preserve headings, lists, tables, links, and reading order without uploading your document.",
  keywords: [
    "pdf to markdown",
    "pdf converter",
    "extract pdf text",
    "pdf table extraction",
    "markdown converter",
    "browser pdf parser",
    "privacy first",
    "client side",
    "localforge",
  ],
  openGraph: {
    title: "PDF to Markdown Converter - LocalForge",
    description:
      "Convert PDFs into structured Markdown privately with local WebAssembly processing.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF to Markdown Converter - LocalForge",
    description:
      "Extract clean Markdown from PDFs locally. Your document never leaves your browser.",
  },
};

const PdfToMarkdownLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default PdfToMarkdownLayout;
