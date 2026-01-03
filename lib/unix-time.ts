/**
 * Unix Time Converter Utilities
 * Handles conversion between Unix timestamps and human-readable dates
 */

export type TimestampUnit =
  | "seconds"
  | "milliseconds"
  | "microseconds"
  | "nanoseconds";
export type TimezoneMode = "local" | "utc";

export interface ConversionResult {
  success: boolean;
  timestamp?: number;
  date?: Date;
  formatted?: FormattedDate;
  relative?: string;
  error?: string;
}

export interface FormattedDate {
  iso: string;
  isoDate: string;
  rfc2822: string;
  localeDate: string;
  localeTime: string;
  localeFull: string;
  // Additional formats
  usDate: string; // MM/DD/YYYY
  euDate: string; // DD-MM-YYYY
  shortDateTime: string; // MM-DD-YYYY HH:mm
  shortTime: string; // Jan 21, 4:27 PM
  monthYear: string; // January 1970
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  dayOfWeek: string;
  dayOfYear: number;
  weekNumber: number;
}

export interface DetailedRelativeTime {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formatted: string;
  simple: string;
}

export type InputFormat = "auto" | "seconds" | "milliseconds" | "iso8601";

export interface TimezoneResult {
  timezone: string;
  formatted: string;
  offset: string;
}

export interface TimestampInfo {
  unit: TimestampUnit;
  digits: number;
  label: string;
}

/**
 * Detect the unit of a timestamp based on its digit count
 */
export const detectTimestampUnit = (timestamp: number): TimestampInfo => {
  const absValue = Math.abs(timestamp);
  const digits = absValue.toString().length;

  if (digits <= 10) {
    return { unit: "seconds", digits: 10, label: "Seconds" };
  }
  if (digits <= 13) {
    return { unit: "milliseconds", digits: 13, label: "Milliseconds" };
  }
  if (digits <= 16) {
    return { unit: "microseconds", digits: 16, label: "Microseconds" };
  }
  return { unit: "nanoseconds", digits: 19, label: "Nanoseconds" };
};

/**
 * Convert timestamp to milliseconds for Date object
 */
export const toMilliseconds = (
  timestamp: number,
  unit: TimestampUnit
): number => {
  switch (unit) {
    case "seconds":
      return timestamp * 1000;
    case "milliseconds":
      return timestamp;
    case "microseconds":
      return timestamp / 1000;
    case "nanoseconds":
      return timestamp / 1_000_000;
    default:
      return timestamp;
  }
};

/**
 * Convert milliseconds to specified unit
 */
export const fromMilliseconds = (ms: number, unit: TimestampUnit): number => {
  switch (unit) {
    case "seconds":
      return Math.floor(ms / 1000);
    case "milliseconds":
      return Math.floor(ms);
    case "microseconds":
      return Math.floor(ms * 1000);
    case "nanoseconds":
      return Math.floor(ms * 1_000_000);
    default:
      return Math.floor(ms);
  }
};

/**
 * Get current timestamp in all units
 */
export const getCurrentTimestamps = () => {
  const now = Date.now();
  return {
    seconds: Math.floor(now / 1000),
    milliseconds: now,
    microseconds: now * 1000,
    nanoseconds: now * 1_000_000,
  };
};

/**
 * Get day of year (1-366)
 */
const getDayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

/**
 * Get ISO week number (1-53)
 */
const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
};

const pad = (n: number, length = 2): string =>
  n.toString().padStart(length, "0");

/**
 * Format a date into multiple representations
 */
export const formatDate = (
  date: Date,
  timezone: TimezoneMode = "local"
): FormattedDate => {
  const isUtc = timezone === "utc";

  const year = isUtc ? date.getUTCFullYear() : date.getFullYear();
  const month = isUtc ? date.getUTCMonth() + 1 : date.getMonth() + 1;
  const day = isUtc ? date.getUTCDate() : date.getDate();
  const hour = isUtc ? date.getUTCHours() : date.getHours();
  const minute = isUtc ? date.getUTCMinutes() : date.getMinutes();
  const second = isUtc ? date.getUTCSeconds() : date.getSeconds();
  const millisecond = isUtc
    ? date.getUTCMilliseconds()
    : date.getMilliseconds();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const shortMonthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayIndex = isUtc ? date.getUTCDay() : date.getDay();

  const hour12 = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";

  return {
    iso: isUtc ? date.toISOString() : date.toISOString().replace("Z", ""),
    isoDate: `${year}-${pad(month)}-${pad(day)}`,
    rfc2822: date.toUTCString(),
    localeDate: date.toLocaleDateString("en-US", {
      timeZone: isUtc ? "UTC" : undefined,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    localeTime: date.toLocaleTimeString("en-US", {
      timeZone: isUtc ? "UTC" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    localeFull: date.toLocaleString("en-US", {
      timeZone: isUtc ? "UTC" : undefined,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    usDate: `${pad(month)}/${pad(day)}/${year}`,
    euDate: `${pad(day)}-${pad(month)}-${year}`,
    shortDateTime: `${pad(month)}-${pad(day)}-${year} ${pad(hour)}:${pad(minute)}`,
    shortTime: `${shortMonthNames[month - 1]} ${day}, ${hour12}:${pad(minute)} ${ampm}`,
    monthYear: `${monthNames[month - 1]} ${year}`,
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
    dayOfWeek: dayNames[dayIndex],
    dayOfYear: getDayOfYear(date),
    weekNumber: getWeekNumber(date),
  };
};

const pluralize = (value: number, singular: string): string =>
  value === 1 ? singular : `${singular}s`;

const TIME_THRESHOLDS = [
  { max: 60, divisor: 1, unit: "second" },
  { max: 3600, divisor: 60, unit: "minute" },
  { max: 86_400, divisor: 3600, unit: "hour" },
  { max: 604_800, divisor: 86_400, unit: "day" },
  { max: 2_419_200, divisor: 604_800, unit: "week" },
  { max: 31_536_000, divisor: 2_629_743, unit: "month" },
  { max: Number.POSITIVE_INFINITY, divisor: 31_556_926, unit: "year" },
] as const;

/**
 * Calculate relative time string
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const absDiffSec = Math.abs(Math.floor(diffMs / 1000));
  const isPast = diffMs < 0;

  if (absDiffSec < 5) {
    return "just now";
  }

  const threshold = TIME_THRESHOLDS.find((t) => absDiffSec < t.max);
  const value = Math.floor(absDiffSec / (threshold?.divisor ?? 1));
  const unit = pluralize(value, threshold?.unit ?? "second");

  return isPast ? `${value} ${unit} ago` : `in ${value} ${unit}`;
};

/**
 * Convert Unix timestamp to date
 */
export const timestampToDate = (
  input: string,
  unit: TimestampUnit = "seconds",
  timezone: TimezoneMode = "local"
): ConversionResult => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, error: "Please enter a timestamp" };
  }

  const timestamp = Number(trimmed);

  if (Number.isNaN(timestamp)) {
    return { success: false, error: "Invalid timestamp format" };
  }

  // Reasonable bounds check (year 1970 to 3000)
  const ms = toMilliseconds(timestamp, unit);
  const minMs = 0; // Jan 1, 1970
  const maxMs = 32_503_680_000_000; // Year 3000

  if (ms < minMs || ms > maxMs) {
    return {
      success: false,
      error: "Timestamp out of valid range (1970-3000)",
    };
  }

  const date = new Date(ms);

  if (Number.isNaN(date.getTime())) {
    return { success: false, error: "Invalid date result" };
  }

  return {
    success: true,
    timestamp,
    date,
    formatted: formatDate(date, timezone),
    relative: getRelativeTime(date),
  };
};

/**
 * Convert human date string to timestamp
 */
export const dateToTimestamp = (
  input: string,
  unit: TimestampUnit = "seconds"
): ConversionResult => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, error: "Please enter a date" };
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return {
      success: false,
      error: "Invalid date format. Try: YYYY-MM-DD HH:MM:SS",
    };
  }

  const ms = date.getTime();
  const timestamp = fromMilliseconds(ms, unit);

  return {
    success: true,
    timestamp,
    date,
    formatted: formatDate(date),
    relative: getRelativeTime(date),
  };
};

/**
 * Parse date components to timestamp
 */
export const componentsToTimestamp = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timezone: TimezoneMode = "local",
  unit: TimestampUnit = "seconds"
): ConversionResult => {
  let date: Date;

  if (timezone === "utc") {
    date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  } else {
    date = new Date(year, month - 1, day, hour, minute, second);
  }

  if (Number.isNaN(date.getTime())) {
    return { success: false, error: "Invalid date components" };
  }

  const ms = date.getTime();
  const timestamp = fromMilliseconds(ms, unit);

  return {
    success: true,
    timestamp,
    date,
    formatted: formatDate(date, timezone),
    relative: getRelativeTime(date),
  };
};

/**
 * Get reference timestamps for common points in time
 */
export const getReferenceTimestamps = (timezone: TimezoneMode = "local") => {
  const now = new Date();
  const isUtc = timezone === "utc";

  // Helper to create date in correct timezone
  const createDate = (
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0
  ): Date => {
    if (isUtc) {
      return new Date(Date.UTC(year, month, day, hour, minute, second));
    }
    return new Date(year, month, day, hour, minute, second);
  };

  const year = isUtc ? now.getUTCFullYear() : now.getFullYear();
  const month = isUtc ? now.getUTCMonth() : now.getMonth();
  const day = isUtc ? now.getUTCDate() : now.getDate();
  const dayOfWeek = isUtc ? now.getUTCDay() : now.getDay();

  // Start/End of today
  const startOfDay = createDate(year, month, day);
  const endOfDay = createDate(year, month, day, 23, 59, 59);

  // Start/End of week (Sunday = 0)
  const startOfWeek = createDate(year, month, day - dayOfWeek);
  const endOfWeek = createDate(year, month, day + (6 - dayOfWeek), 23, 59, 59);

  // Start/End of month
  const startOfMonth = createDate(year, month, 1);
  const endOfMonth = createDate(year, month + 1, 0, 23, 59, 59);

  // Start/End of year
  const startOfYear = createDate(year, 0, 1);
  const endOfYear = createDate(year, 11, 31, 23, 59, 59);

  return {
    startOfDay: Math.floor(startOfDay.getTime() / 1000),
    endOfDay: Math.floor(endOfDay.getTime() / 1000),
    startOfWeek: Math.floor(startOfWeek.getTime() / 1000),
    endOfWeek: Math.floor(endOfWeek.getTime() / 1000),
    startOfMonth: Math.floor(startOfMonth.getTime() / 1000),
    endOfMonth: Math.floor(endOfMonth.getTime() / 1000),
    startOfYear: Math.floor(startOfYear.getTime() / 1000),
    endOfYear: Math.floor(endOfYear.getTime() / 1000),
  };
};

/**
 * Time constants in seconds
 */
export const TIME_CONSTANTS = {
  minute: 60,
  hour: 3600,
  day: 86_400,
  week: 604_800,
  month: 2_629_743, // 30.44 days
  year: 31_556_926, // 365.24 days
} as const;

/**
 * Example timestamps for demonstration
 */
export const EXAMPLE_TIMESTAMPS = {
  unixEpoch: 0,
  y2k: 946_684_800,
  y2038Problem: 2_147_483_647, // Max 32-bit signed integer
  current: () => Math.floor(Date.now() / 1000),
};

/**
 * Validate if a string is a valid timestamp
 */
export const isValidTimestamp = (input: string): boolean => {
  const trimmed = input.trim();
  if (!trimmed) {
    return false;
  }
  const num = Number(trimmed);
  if (Number.isNaN(num)) {
    return false;
  }
  const ms = toMilliseconds(num, detectTimestampUnit(num).unit);
  return ms >= 0 && ms <= 32_503_680_000_000;
};

/**
 * Calculate detailed relative time breakdown
 */
export const getDetailedRelativeTime = (date: Date): DetailedRelativeTime => {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isPast = diffMs < 0;
  let remaining = Math.abs(Math.floor(diffMs / 1000));

  const years = Math.floor(remaining / 31_556_926);
  remaining %= 31_556_926;

  const months = Math.floor(remaining / 2_629_743);
  remaining %= 2_629_743;

  const days = Math.floor(remaining / 86_400);
  remaining %= 86_400;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  // Build formatted string
  const parts: string[] = [];
  if (years > 0) {
    parts.push(`${years}yr`);
  }
  if (months > 0) {
    parts.push(`${months}mo`);
  }
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}hr`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds}sec`);
  }

  const formatted = parts.join(" ") + (isPast ? " ago" : " from now");

  // Simple version
  const simple = getRelativeTime(date);

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    isPast,
    formatted,
    simple,
  };
};

/**
 * Parse and evaluate timestamp expressions with math operators
 * Supports: +, -, *, / and time units (s, m, h, d, w)
 * Examples: "1704067200+3600", "now+1d", "1704067200-1w"
 */
export const parseTimestampExpression = (
  input: string,
  unit: TimestampUnit = "seconds"
): { success: boolean; value?: number; error?: string } => {
  const trimmed = input.trim().toLowerCase();

  if (!trimmed) {
    return { success: false, error: "Empty input" };
  }

  // Replace "now" with current timestamp
  let expression = trimmed.replace(
    /\bnow\b/g,
    Math.floor(Date.now() / 1000).toString()
  );

  // Parse time unit suffixes (1d, 2h, 30m, etc.)
  // Must be done before math evaluation
  expression = expression.replace(/(\d+)([smhdw])\b/g, (_, num, suffix) => {
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86_400,
      w: 604_800,
    };
    return (Number.parseInt(num, 10) * multipliers[suffix]).toString();
  });

  // Only allow numbers, operators, parentheses, and whitespace
  if (!/^[\d\s+\-*/().]+$/.test(expression)) {
    return { success: false, error: "Invalid characters in expression" };
  }

  try {
    // Use Function constructor for safe math evaluation (no access to global scope)
    // biome-ignore lint/security/noGlobalEval: Safe evaluation of numeric expression only
    const result = new Function(`"use strict"; return (${expression})`)();

    if (
      typeof result !== "number" ||
      Number.isNaN(result) ||
      !Number.isFinite(result)
    ) {
      return { success: false, error: "Invalid expression result" };
    }

    return { success: true, value: Math.floor(result) };
  } catch {
    return { success: false, error: "Failed to evaluate expression" };
  }
};

/**
 * Format date in a specific timezone
 */
export const formatInTimezone = (
  date: Date,
  timezone: string
): TimezoneResult | null => {
  try {
    const formatted = date.toLocaleString("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });

    const offset =
      date
        .toLocaleString("en-US", {
          timeZone: timezone,
          timeZoneName: "longOffset",
        })
        .split(" ")
        .pop() || "";

    return {
      timezone,
      formatted,
      offset,
    };
  } catch {
    return null;
  }
};

/**
 * Get list of common timezones
 */
export const COMMON_TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

/**
 * Get all available timezone names
 */
export const getAllTimezones = (): string[] => {
  // Use Intl API to get supported timezones
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older browsers
    return [...COMMON_TIMEZONES];
  }
};

/**
 * Parse input based on selected format
 */
export const parseInput = (
  input: string,
  format: InputFormat,
  unit: TimestampUnit = "seconds"
): { success: boolean; timestamp?: number; error?: string } => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { success: false, error: "Empty input" };
  }

  switch (format) {
    case "iso8601": {
      const date = new Date(trimmed);
      if (Number.isNaN(date.getTime())) {
        return { success: false, error: "Invalid ISO 8601 date" };
      }
      return {
        success: true,
        timestamp: fromMilliseconds(date.getTime(), unit),
      };
    }

    case "seconds": {
      // Check for expression first
      if (/\bnow\b|\d+[smhdw]$|[+\-*/]/.test(trimmed)) {
        const exprResult = parseTimestampExpression(trimmed, unit);
        if (exprResult.success && exprResult.value !== undefined) {
          return { success: true, timestamp: exprResult.value };
        }
      }
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        return { success: false, error: "Invalid number" };
      }
      return { success: true, timestamp: Math.floor(num) };
    }

    case "milliseconds": {
      // Check for expression first
      if (/\bnow\b|\d+[smhdw]$|[+\-*/]/.test(trimmed)) {
        const exprResult = parseTimestampExpression(trimmed, unit);
        if (exprResult.success && exprResult.value !== undefined) {
          return { success: true, timestamp: exprResult.value };
        }
      }
      const num = Number(trimmed);
      if (Number.isNaN(num)) {
        return { success: false, error: "Invalid number" };
      }
      return { success: true, timestamp: fromMilliseconds(num, unit) };
    }

    case "auto":
    default: {
      // Try expression parsing first (handles "now", math operators)
      const exprResult = parseTimestampExpression(trimmed, unit);
      if (exprResult.success && exprResult.value !== undefined) {
        return { success: true, timestamp: exprResult.value };
      }

      // Try as number
      const num = Number(trimmed);
      if (!Number.isNaN(num)) {
        return { success: true, timestamp: Math.floor(num) };
      }

      // Try as date string
      const date = new Date(trimmed);
      if (!Number.isNaN(date.getTime())) {
        return {
          success: true,
          timestamp: fromMilliseconds(date.getTime(), unit),
        };
      }

      return { success: false, error: "Could not parse input" };
    }
  }
};
