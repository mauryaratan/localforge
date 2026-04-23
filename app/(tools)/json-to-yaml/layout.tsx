import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON ↔ YAML Converter",
  description:
    "Convert between JSON and YAML formats instantly with live preview. Features validation, formatting, and minification. Perfect for Kubernetes configs and API configurations.",
  keywords: [
    "json",
    "yaml",
    "json to yaml",
    "yaml to json",
    "converter",
    "formatter",
    "kubernetes",
    "config",
    "localforge",
  ],
  openGraph: {
    title: "JSON YAML Converter - LocalForge",
    description:
      "Convert between JSON and YAML formats instantly with live preview and validation",
    type: "website",
  },
};

const JsonYamlLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default JsonYamlLayout;
