import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  componentsToTimestamp,
  dateToTimestamp,
  detectTimestampUnit,
  formatDate,
  formatInTimezone,
  fromMilliseconds,
  getCurrentTimestamps,
  getDetailedRelativeTime,
  getReferenceTimestamps,
  getRelativeTime,
  isValidTimestamp,
  parseInput,
  parseTimestampExpression,
  TIME_CONSTANTS,
  timestampToDate,
  toMilliseconds,
} from "@/lib/unix-time";

describe("detectTimestampUnit", () => {
  it("should detect seconds (10 digits)", () => {
    const result = detectTimestampUnit(1_704_067_200);
    expect(result.unit).toBe("seconds");
    expect(result.digits).toBe(10);
  });

  it("should detect milliseconds (13 digits)", () => {
    const result = detectTimestampUnit(1_704_067_200_000);
    expect(result.unit).toBe("milliseconds");
    expect(result.digits).toBe(13);
  });

  it("should detect microseconds (16 digits)", () => {
    const result = detectTimestampUnit(1_704_067_200_000_000);
    expect(result.unit).toBe("microseconds");
    expect(result.digits).toBe(16);
  });

  it("should detect nanoseconds (19 digits)", () => {
    const result = detectTimestampUnit(1_704_067_200_000_000_000);
    expect(result.unit).toBe("nanoseconds");
    expect(result.digits).toBe(19);
  });

  it("should handle small timestamps as seconds", () => {
    const result = detectTimestampUnit(1000);
    expect(result.unit).toBe("seconds");
  });

  it("should handle negative timestamps", () => {
    const result = detectTimestampUnit(-1_704_067_200);
    expect(result.unit).toBe("seconds");
  });
});

describe("toMilliseconds", () => {
  it("should convert seconds to milliseconds", () => {
    expect(toMilliseconds(1000, "seconds")).toBe(1_000_000);
  });

  it("should return milliseconds unchanged", () => {
    expect(toMilliseconds(1000, "milliseconds")).toBe(1000);
  });

  it("should convert microseconds to milliseconds", () => {
    expect(toMilliseconds(1_000_000, "microseconds")).toBe(1000);
  });

  it("should convert nanoseconds to milliseconds", () => {
    expect(toMilliseconds(1_000_000_000, "nanoseconds")).toBe(1000);
  });
});

describe("fromMilliseconds", () => {
  it("should convert milliseconds to seconds", () => {
    expect(fromMilliseconds(1000, "seconds")).toBe(1);
  });

  it("should return milliseconds unchanged", () => {
    expect(fromMilliseconds(1000, "milliseconds")).toBe(1000);
  });

  it("should convert milliseconds to microseconds", () => {
    expect(fromMilliseconds(1000, "microseconds")).toBe(1_000_000);
  });

  it("should convert milliseconds to nanoseconds", () => {
    expect(fromMilliseconds(1000, "nanoseconds")).toBe(1_000_000_000);
  });
});

describe("getCurrentTimestamps", () => {
  it("should return all timestamp units", () => {
    const result = getCurrentTimestamps();
    expect(result).toHaveProperty("seconds");
    expect(result).toHaveProperty("milliseconds");
    expect(result).toHaveProperty("microseconds");
    expect(result).toHaveProperty("nanoseconds");
  });

  it("should return consistent values across units", () => {
    const result = getCurrentTimestamps();
    // Allow small timing variance since Date.now() is called once
    expect(Math.floor(result.milliseconds / 1000)).toBe(result.seconds);
    expect(result.microseconds).toBe(result.milliseconds * 1000);
    expect(result.nanoseconds).toBe(result.microseconds * 1000);
  });
});

describe("formatDate", () => {
  const testDate = new Date("2024-01-01T12:30:45.123Z");

  it("should format date with all properties", () => {
    const result = formatDate(testDate, "utc");
    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(1);
    expect(result.hour).toBe(12);
    expect(result.minute).toBe(30);
    expect(result.second).toBe(45);
    expect(result.millisecond).toBe(123);
    expect(result.dayOfWeek).toBe("Monday");
  });

  it("should return ISO format", () => {
    const result = formatDate(testDate, "utc");
    expect(result.iso).toBe("2024-01-01T12:30:45.123Z");
  });

  it("should calculate day of year", () => {
    const result = formatDate(testDate, "utc");
    expect(result.dayOfYear).toBe(1);
  });

  it("should calculate week number", () => {
    const result = formatDate(testDate, "utc");
    expect(result.weekNumber).toBeGreaterThanOrEqual(1);
    expect(result.weekNumber).toBeLessThanOrEqual(53);
  });
});

describe("getRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return 'just now' for very recent times", () => {
    const date = new Date("2024-06-15T11:59:58Z");
    expect(getRelativeTime(date)).toBe("just now");
  });

  it("should return seconds ago", () => {
    const date = new Date("2024-06-15T11:59:30Z");
    expect(getRelativeTime(date)).toBe("30 seconds ago");
  });

  it("should return minutes ago", () => {
    const date = new Date("2024-06-15T11:55:00Z");
    expect(getRelativeTime(date)).toBe("5 minutes ago");
  });

  it("should return hours ago", () => {
    const date = new Date("2024-06-15T09:00:00Z");
    expect(getRelativeTime(date)).toBe("3 hours ago");
  });

  it("should return days ago", () => {
    const date = new Date("2024-06-12T12:00:00Z");
    expect(getRelativeTime(date)).toBe("3 days ago");
  });

  it("should return future times", () => {
    const date = new Date("2024-06-15T15:00:00Z");
    expect(getRelativeTime(date)).toBe("in 3 hours");
  });
});

describe("timestampToDate", () => {
  it("should convert valid timestamp", () => {
    const result = timestampToDate("1704067200", "seconds", "utc");
    expect(result.success).toBe(true);
    expect(result.date).toBeDefined();
    expect(result.formatted?.year).toBe(2024);
  });

  it("should handle milliseconds", () => {
    const result = timestampToDate("1704067200000", "milliseconds", "utc");
    expect(result.success).toBe(true);
    expect(result.formatted?.year).toBe(2024);
  });

  it("should return error for empty input", () => {
    const result = timestampToDate("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter a timestamp");
  });

  it("should return error for invalid input", () => {
    const result = timestampToDate("not-a-number");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid timestamp format");
  });

  it("should return error for out of range timestamp", () => {
    const result = timestampToDate("99999999999999999999");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Timestamp out of valid range (1970-3000)");
  });

  it("should include relative time", () => {
    const result = timestampToDate("1704067200", "seconds");
    expect(result.success).toBe(true);
    expect(result.relative).toBeDefined();
  });
});

describe("dateToTimestamp", () => {
  it("should convert valid date string", () => {
    const result = dateToTimestamp("2024-01-01T00:00:00Z", "seconds");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should convert to milliseconds", () => {
    const result = dateToTimestamp("2024-01-01T00:00:00Z", "milliseconds");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200_000);
  });

  it("should return error for empty input", () => {
    const result = dateToTimestamp("");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter a date");
  });

  it("should return error for invalid date", () => {
    const result = dateToTimestamp("not-a-date");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid date format. Try: YYYY-MM-DD HH:MM:SS");
  });

  it("should handle various date formats", () => {
    const result1 = dateToTimestamp("January 1, 2024");
    expect(result1.success).toBe(true);

    const result2 = dateToTimestamp("2024/01/01");
    expect(result2.success).toBe(true);
  });
});

describe("componentsToTimestamp", () => {
  it("should convert date components to timestamp", () => {
    const result = componentsToTimestamp(2024, 1, 1, 0, 0, 0, "utc", "seconds");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should handle local timezone", () => {
    const result = componentsToTimestamp(
      2024,
      1,
      1,
      0,
      0,
      0,
      "local",
      "seconds"
    );
    expect(result.success).toBe(true);
    expect(result.timestamp).toBeDefined();
  });

  it("should convert to different units", () => {
    const resultSeconds = componentsToTimestamp(
      2024,
      1,
      1,
      0,
      0,
      0,
      "utc",
      "seconds"
    );
    const resultMs = componentsToTimestamp(
      2024,
      1,
      1,
      0,
      0,
      0,
      "utc",
      "milliseconds"
    );

    expect(resultMs.timestamp).toBe((resultSeconds.timestamp ?? 0) * 1000);
  });
});

describe("getReferenceTimestamps", () => {
  it("should return all reference timestamps", () => {
    const result = getReferenceTimestamps("utc");
    expect(result).toHaveProperty("startOfDay");
    expect(result).toHaveProperty("endOfDay");
    expect(result).toHaveProperty("startOfWeek");
    expect(result).toHaveProperty("endOfWeek");
    expect(result).toHaveProperty("startOfMonth");
    expect(result).toHaveProperty("endOfMonth");
    expect(result).toHaveProperty("startOfYear");
    expect(result).toHaveProperty("endOfYear");
  });

  it("should return valid timestamps", () => {
    const result = getReferenceTimestamps("utc");
    expect(result.startOfDay).toBeLessThan(result.endOfDay);
    expect(result.startOfWeek).toBeLessThan(result.endOfWeek);
    expect(result.startOfMonth).toBeLessThan(result.endOfMonth);
    expect(result.startOfYear).toBeLessThan(result.endOfYear);
  });
});

describe("isValidTimestamp", () => {
  it("should validate correct timestamps", () => {
    expect(isValidTimestamp("1704067200")).toBe(true);
    expect(isValidTimestamp("1704067200000")).toBe(true);
  });

  it("should reject invalid timestamps", () => {
    expect(isValidTimestamp("not-a-number")).toBe(false);
    expect(isValidTimestamp("")).toBe(false);
  });

  it("should handle whitespace", () => {
    expect(isValidTimestamp("  1704067200  ")).toBe(true);
  });
});

describe("TIME_CONSTANTS", () => {
  it("should have correct values", () => {
    expect(TIME_CONSTANTS.minute).toBe(60);
    expect(TIME_CONSTANTS.hour).toBe(3600);
    expect(TIME_CONSTANTS.day).toBe(86_400);
    expect(TIME_CONSTANTS.week).toBe(604_800);
  });
});

describe("getDetailedRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return detailed breakdown for past dates", () => {
    const date = new Date("2023-06-14T10:06:25Z");
    const result = getDetailedRelativeTime(date);
    expect(result.isPast).toBe(true);
    expect(result.years).toBe(1);
    expect(result.formatted).toContain("ago");
  });

  it("should return detailed breakdown for future dates", () => {
    const date = new Date("2024-06-16T14:00:00Z");
    const result = getDetailedRelativeTime(date);
    expect(result.isPast).toBe(false);
    expect(result.formatted).toContain("from now");
  });

  it("should calculate hours correctly", () => {
    const date = new Date("2024-06-15T09:00:00Z");
    const result = getDetailedRelativeTime(date);
    expect(result.hours).toBe(3);
  });
});

describe("parseTimestampExpression", () => {
  it("should parse simple numbers", () => {
    const result = parseTimestampExpression("1704067200");
    expect(result.success).toBe(true);
    expect(result.value).toBe(1_704_067_200);
  });

  it("should handle math operators", () => {
    const result = parseTimestampExpression("1000+500");
    expect(result.success).toBe(true);
    expect(result.value).toBe(1500);
  });

  it("should parse time units", () => {
    const result = parseTimestampExpression("1d");
    expect(result.success).toBe(true);
    expect(result.value).toBe(86_400);
  });

  it("should parse complex expressions", () => {
    const result = parseTimestampExpression("1000+1h");
    expect(result.success).toBe(true);
    expect(result.value).toBe(1000 + 3600);
  });

  it("should handle now keyword", () => {
    const result = parseTimestampExpression("now");
    expect(result.success).toBe(true);
    expect(result.value).toBeDefined();
  });

  it("should reject invalid expressions", () => {
    const result = parseTimestampExpression("invalid$chars");
    expect(result.success).toBe(false);
  });

  it("should reject empty input", () => {
    const result = parseTimestampExpression("");
    expect(result.success).toBe(false);
  });
});

describe("formatInTimezone", () => {
  it("should format date in UTC timezone", () => {
    const date = new Date("2024-01-01T12:00:00Z");
    const result = formatInTimezone(date, "UTC");
    expect(result).not.toBeNull();
    expect(result?.timezone).toBe("UTC");
    expect(result?.formatted).toContain("2024");
  });

  it("should format date in specific timezone", () => {
    const date = new Date("2024-01-01T12:00:00Z");
    const result = formatInTimezone(date, "America/New_York");
    expect(result).not.toBeNull();
    expect(result?.timezone).toBe("America/New_York");
  });

  it("should return null for invalid timezone", () => {
    const date = new Date("2024-01-01T12:00:00Z");
    const result = formatInTimezone(date, "Invalid/Timezone");
    expect(result).toBeNull();
  });
});

describe("parseInput", () => {
  it("should auto-detect timestamp", () => {
    const result = parseInput("1704067200", "auto");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should parse ISO 8601 format", () => {
    const result = parseInput("2024-01-01T00:00:00Z", "iso8601");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should parse seconds format", () => {
    const result = parseInput("1704067200", "seconds");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should parse milliseconds format", () => {
    // parseInput with milliseconds format converts ms to the output unit (defaults to seconds)
    const result = parseInput("1704067200000", "milliseconds", "seconds");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBe(1_704_067_200);
  });

  it("should handle expressions", () => {
    const result = parseInput("now+1d", "auto");
    expect(result.success).toBe(true);
    expect(result.timestamp).toBeDefined();
  });

  it("should return error for invalid input", () => {
    const result = parseInput("not-valid", "seconds");
    expect(result.success).toBe(false);
  });
});
