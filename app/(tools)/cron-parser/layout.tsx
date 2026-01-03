import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cron Parser - DevTools",
  description:
    "Parse and validate cron expressions with human-readable descriptions, field breakdowns, and next execution times. Supports standard 5-field cron syntax.",
  keywords: [
    "cron",
    "cron parser",
    "cron expression",
    "crontab",
    "scheduler",
    "devtools",
  ],
  openGraph: {
    title: "Cron Parser - DevTools",
    description:
      "Parse and validate cron expressions with human-readable descriptions",
    type: "website",
  },
};

const CronParserLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default CronParserLayout;
