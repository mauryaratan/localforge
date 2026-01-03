import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Tester - DevTools",
  description:
    "Test, debug, and build regular expressions with real-time matching, syntax highlighting, capture groups, and substitution. Includes common patterns and quick reference guide.",
  keywords: [
    "regex",
    "regex tester",
    "regular expression",
    "regex debugger",
    "regex builder",
    "regex matcher",
    "pattern matching",
    "javascript regex",
    "regex replace",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "Regex Tester - DevTools",
    description:
      "Test and debug regular expressions with real-time matching, capture groups, and substitution support.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Regex Tester - DevTools",
    description:
      "Test and debug regular expressions with real-time matching and capture groups",
  },
};

const RegexTesterLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default RegexTesterLayout;
