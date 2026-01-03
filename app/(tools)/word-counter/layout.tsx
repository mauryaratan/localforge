import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word Counter - DevTools",
  description:
    "Count words, characters, sentences, and paragraphs in your text. Calculate reading time, speaking time, and view detailed text statistics. Free online word counter tool.",
  keywords: [
    "word counter",
    "character counter",
    "word count",
    "character count",
    "reading time",
    "speaking time",
    "text analysis",
    "paragraph counter",
    "sentence counter",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "Word Counter - DevTools",
    description:
      "Count words, characters, sentences, and paragraphs. Calculate reading and speaking time with detailed text statistics.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Word Counter - DevTools",
    description:
      "Count words, characters, sentences, and paragraphs with reading time calculator",
  },
};

const WordCounterLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default WordCounterLayout;
