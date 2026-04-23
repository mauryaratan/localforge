import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Schema Validator",
  description:
    "Validate JSON against JSON Schema locally in your browser with detailed error paths and schema diagnostics.",
  keywords: [
    "json schema",
    "json schema validator",
    "json validator",
    "ajv",
    "api payload validator",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Schema Validator - LocalForge",
    description:
      "Validate JSON against JSON Schema locally with detailed error paths.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Schema Validator - LocalForge",
    description: "Privacy-first JSON Schema validation",
  },
};

const JsonSchemaValidatorLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => children;

export default JsonSchemaValidatorLayout;
