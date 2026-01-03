import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON CSV Converter - DevTools",
  description:
    "Convert between JSON and CSV formats instantly. Features auto-delimiter detection, nested object flattening, and smart type parsing. Perfect for data transformation and spreadsheet exports.",
  keywords: [
    "json",
    "csv",
    "json to csv",
    "csv to json",
    "converter",
    "data transformation",
    "spreadsheet",
    "export",
    "devtools",
  ],
  openGraph: {
    title: "JSON CSV Converter - DevTools",
    description:
      "Convert between JSON and CSV formats instantly with auto-delimiter detection and nested object flattening",
    type: "website",
  },
};

const JsonCsvLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default JsonCsvLayout;
