import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV File Splitter",
  description:
    "Split large CSV files into smaller size-based chunks in your browser, repeat headers automatically, and download every part as one ZIP file.",
  keywords: [
    "csv splitter",
    "file splitter",
    "split csv by size",
    "csv chunks",
    "zip csv files",
    "privacy first",
    "client side",
    "localforge",
  ],
  openGraph: {
    title: "CSV File Splitter - LocalForge",
    description:
      "Split large CSV files by target size with client-side processing and ZIP download.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV File Splitter - LocalForge",
    description:
      "Split large CSV files by target size with private, client-side processing.",
  },
};

const CsvFileSplitterLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default CsvFileSplitterLayout;
