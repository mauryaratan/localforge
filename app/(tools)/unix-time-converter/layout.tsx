import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unix Time Converter - DevTools",
  description:
    "Convert Unix timestamps to human-readable dates and vice versa. Supports seconds, milliseconds, microseconds, and nanoseconds with UTC and local timezone options.",
  keywords: [
    "unix timestamp",
    "epoch converter",
    "unix time",
    "timestamp converter",
    "date converter",
    "epoch time",
    "milliseconds",
    "devtools",
  ],
  openGraph: {
    title: "Unix Time Converter - DevTools",
    description:
      "Convert Unix timestamps to human-readable dates and vice versa",
    type: "website",
  },
};

const UnixTimeConverterLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return children;
};

export default UnixTimeConverterLayout;
