import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID & ULID Generator - DevTools",
  description:
    "Generate UUIDs (v4, v7) and ULIDs instantly. Create unique identifiers for databases, APIs, and distributed systems. Parse and validate existing IDs with timestamp extraction.",
  keywords: [
    "uuid",
    "uuid generator",
    "uuid v4",
    "uuid v7",
    "ulid",
    "ulid generator",
    "unique identifier",
    "guid",
    "random id",
    "time-ordered uuid",
    "sortable id",
    "devtools",
    "developer tools",
  ],
  openGraph: {
    title: "UUID & ULID Generator - DevTools",
    description:
      "Generate UUIDs (v4, v7) and ULIDs instantly. Parse and validate existing identifiers.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "UUID & ULID Generator - DevTools",
    description: "Generate UUIDs and ULIDs with parsing and validation",
  },
};

const UuidGeneratorLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default UuidGeneratorLayout;
