import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "String Case Converter - DevTools",
  description:
    "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, and 12+ more formats. Perfect for variable naming, URL slugs, and code formatting.",
  keywords: [
    "string case converter",
    "camelCase",
    "PascalCase",
    "snake_case",
    "kebab-case",
    "CONSTANT_CASE",
    "title case",
    "sentence case",
    "text converter",
    "variable naming",
    "code formatter",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "String Case Converter - DevTools",
    description:
      "Convert text between camelCase, PascalCase, snake_case, kebab-case, and 12+ more formats instantly.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "String Case Converter - DevTools",
    description:
      "Convert text between camelCase, PascalCase, snake_case, kebab-case, and more",
  },
};

const StringCaseConverterLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return children;
};

export default StringCaseConverterLayout;
