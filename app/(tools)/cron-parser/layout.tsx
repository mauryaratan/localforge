import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Parser",
  description:
    "Parse and validate cron expressions with human-readable descriptions, field breakdowns, and next execution times. Supports standard 5-field cron syntax. Privacy-first — runs entirely in your browser.",
  keywords: [
    "cron",
    "cron parser",
    "cron expression",
    "crontab",
    "cron validator",
    "cron scheduler",
    "cron syntax",
    "cron job",
    "localforge",
    "developer tools",
  ],
  openGraph: {
    title: "Cron Parser - LocalForge",
    description:
      "Parse and validate cron expressions with human-readable descriptions and next execution times.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cron Parser - LocalForge",
    description:
      "Parse and validate cron expressions with human-readable output.",
  },
};

const CronParserLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default CronParserLayout;
