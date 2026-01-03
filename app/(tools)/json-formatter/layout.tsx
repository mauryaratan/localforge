import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Validator - DevTools",
  description:
    "Format, validate, and query JSON data with JSONPath. Features syntax highlighting, tree view, minification, and real-time validation. Perfect for API debugging and configuration files.",
  keywords: [
    "json",
    "json formatter",
    "json validator",
    "jsonpath",
    "json beautifier",
    "json minifier",
    "json tree view",
    "json path finder",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Formatter & Validator - DevTools",
    description:
      "Format, validate, and query JSON data with JSONPath. Tree view, syntax validation, and real-time formatting.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Formatter & Validator - DevTools",
    description: "Format, validate, and query JSON data with JSONPath support",
  },
};

const JsonFormatterLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default JsonFormatterLayout;
