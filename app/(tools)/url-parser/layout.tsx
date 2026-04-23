import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Parser & Builder",
  description:
    "Parse, analyze, and modify URL components including protocol, host, path, and query parameters. Build URLs interactively with real-time updates. Privacy-first — all processing happens in your browser.",
  keywords: [
    "url parser",
    "url builder",
    "url decoder",
    "query string parser",
    "url components",
    "url analyzer",
    "parse url",
    "url breakdown",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "URL Parser & Builder - LocalForge",
    description:
      "Parse and modify URL components interactively. Extract protocol, host, path, and query parameters instantly.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "URL Parser & Builder - LocalForge",
    description:
      "Parse and modify URL components with real-time updates. Privacy-first.",
  },
};

const URLParserLayout = ({ children }: { children: React.ReactNode }) =>
  children;

export default URLParserLayout;
