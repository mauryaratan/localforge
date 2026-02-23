import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Diff Viewer & Comparator",
  description:
    "Compare two JSON objects and visualize differences. See additions, deletions, and changes highlighted. Privacy-first — runs entirely in your browser.",
  keywords: [
    "json diff",
    "json compare",
    "json comparator",
    "json difference",
    "compare json objects",
    "json diff viewer",
    "json comparison tool",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "JSON Diff Viewer - LocalForge",
    description:
      "Compare two JSON objects and visualize differences with highlighted additions, deletions, and changes.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "JSON Diff Viewer - LocalForge",
    description: "Compare JSON objects and visualize differences instantly",
  },
};

const JsonDiffLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default JsonDiffLayout;
