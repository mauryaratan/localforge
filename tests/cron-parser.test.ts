import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CRON_EXAMPLES, formatNextRun, parseCron } from "@/lib/cron-parser";

const TIME_FORMAT_REGEX = /2:30\s*PM/i;

describe("parseCron", () => {
  describe("validation", () => {
    it("should return error for empty string", () => {
      const result = parseCron("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a cron expression");
    });

    it("should return error for whitespace only", () => {
      const result = parseCron("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a cron expression");
    });

    it("should return error for too few fields", () => {
      const result = parseCron("* * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Expected 5 fields");
    });

    it("should return error for too many fields", () => {
      const result = parseCron("* * * * * * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Expected 5 fields");
    });

    it("should return error for invalid minute value", () => {
      const result = parseCron("60 * * * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("out of range");
    });

    it("should return error for invalid hour value", () => {
      const result = parseCron("* 25 * * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("out of range");
    });

    it("should return error for invalid day of month", () => {
      const result = parseCron("* * 32 * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("out of range");
    });

    it("should return error for invalid month", () => {
      const result = parseCron("* * * 13 *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("out of range");
    });

    it("should return error for invalid day of week", () => {
      const result = parseCron("* * * * 8");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("out of range");
    });
  });

  describe("basic expressions", () => {
    it("should parse every minute (* * * * *)", () => {
      const result = parseCron("* * * * *");
      expect(result.isValid).toBe(true);
      expect(result.fields).toHaveLength(5);
      expect(result.description).toBe("Every minute");
    });

    it("should parse every hour (0 * * * *)", () => {
      const result = parseCron("0 * * * *");
      expect(result.isValid).toBe(true);
      expect(result.description).toBe("Every hour");
    });

    it("should parse daily at midnight (0 0 * * *)", () => {
      const result = parseCron("0 0 * * *");
      expect(result.isValid).toBe(true);
      expect(result.description).toContain("12:00 AM");
    });

    it("should parse specific time (30 14 * * *)", () => {
      const result = parseCron("30 14 * * *");
      expect(result.isValid).toBe(true);
      expect(result.description).toContain("2:30 PM");
    });
  });

  describe("step values", () => {
    it("should parse every 15 minutes (*/15 * * * *)", () => {
      const result = parseCron("*/15 * * * *");
      expect(result.isValid).toBe(true);
      expect(result.description).toContain("15 minutes");
    });

    it("should parse every 2 hours (0 */2 * * *)", () => {
      const result = parseCron("0 */2 * * *");
      expect(result.isValid).toBe(true);
      expect(result.description).toContain("2 hours");
    });

    it("should parse step with range (0-30/10 * * * *)", () => {
      const result = parseCron("0-30/10 * * * *");
      expect(result.isValid).toBe(true);
      expect(result.fields[0].valid).toBe(true);
    });
  });

  describe("ranges", () => {
    it("should parse weekday range (0 9 * * 1-5)", () => {
      const result = parseCron("0 9 * * 1-5");
      expect(result.isValid).toBe(true);
      expect(result.fields[4].description).toContain("Monday");
      expect(result.fields[4].description).toContain("Friday");
    });

    it("should parse month range (0 0 1 1-6 *)", () => {
      const result = parseCron("0 0 1 1-6 *");
      expect(result.isValid).toBe(true);
      expect(result.fields[3].description).toContain("January");
      expect(result.fields[3].description).toContain("June");
    });

    it("should return error for invalid range (5-3 * * * *)", () => {
      const result = parseCron("5-3 * * * *");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("start");
    });
  });

  describe("lists", () => {
    it("should parse minute list (0,15,30,45 * * * *)", () => {
      const result = parseCron("0,15,30,45 * * * *");
      expect(result.isValid).toBe(true);
      expect(result.fields[0].description).toContain("0");
      expect(result.fields[0].description).toContain("45");
    });

    it("should parse day list (0 0 1,15 * *)", () => {
      const result = parseCron("0 0 1,15 * *");
      expect(result.isValid).toBe(true);
      expect(result.fields[2].description).toContain("1");
      expect(result.fields[2].description).toContain("15");
    });

    it("should parse weekend days (0 0 * * 0,6)", () => {
      const result = parseCron("0 0 * * 0,6");
      expect(result.isValid).toBe(true);
      expect(result.fields[4].description).toContain("Sunday");
      expect(result.fields[4].description).toContain("Saturday");
    });
  });

  describe("named values", () => {
    it("should parse month names (0 0 1 JAN *)", () => {
      const result = parseCron("0 0 1 JAN *");
      expect(result.isValid).toBe(true);
      expect(result.fields[3].description).toBe("January");
    });

    it("should parse day names (0 0 * * MON)", () => {
      const result = parseCron("0 0 * * MON");
      expect(result.isValid).toBe(true);
      expect(result.fields[4].description).toBe("Monday");
    });

    it("should parse mixed case names (0 0 * * mon-fri)", () => {
      const result = parseCron("0 0 * * mon-fri");
      expect(result.isValid).toBe(true);
    });

    it("should parse named range (0 0 * JAN-JUN *)", () => {
      const result = parseCron("0 0 * JAN-JUN *");
      expect(result.isValid).toBe(true);
    });
  });

  describe("field breakdown", () => {
    it("should correctly identify each field", () => {
      const result = parseCron("30 14 15 6 3");
      expect(result.isValid).toBe(true);

      expect(result.fields[0].name).toBe("Minute");
      expect(result.fields[0].value).toBe("30");

      expect(result.fields[1].name).toBe("Hour");
      expect(result.fields[1].value).toBe("14");

      expect(result.fields[2].name).toBe("Day of Month");
      expect(result.fields[2].value).toBe("15");

      expect(result.fields[3].name).toBe("Month");
      expect(result.fields[3].value).toBe("6");

      expect(result.fields[4].name).toBe("Day of Week");
      expect(result.fields[4].value).toBe("3");
    });

    it("should provide correct min/max for each field", () => {
      const result = parseCron("* * * * *");
      expect(result.fields[0].min).toBe(0);
      expect(result.fields[0].max).toBe(59);
      expect(result.fields[1].min).toBe(0);
      expect(result.fields[1].max).toBe(23);
      expect(result.fields[2].min).toBe(1);
      expect(result.fields[2].max).toBe(31);
      expect(result.fields[3].min).toBe(1);
      expect(result.fields[3].max).toBe(12);
      expect(result.fields[4].min).toBe(0);
      expect(result.fields[4].max).toBe(6);
    });
  });

  describe("next runs", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2024-01-15T10:30:00"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should calculate next runs for every minute", () => {
      const result = parseCron("* * * * *");
      expect(result.nextRuns).toHaveLength(5);
      expect(result.nextRuns[0].getMinutes()).toBe(31);
    });

    it("should calculate next runs for specific time", () => {
      const result = parseCron("0 12 * * *");
      expect(result.nextRuns).toHaveLength(5);
      expect(result.nextRuns[0].getHours()).toBe(12);
      expect(result.nextRuns[0].getMinutes()).toBe(0);
    });

    it("should return empty array for invalid expression", () => {
      const result = parseCron("invalid");
      expect(result.nextRuns).toHaveLength(0);
    });
  });
});

describe("formatNextRun", () => {
  it("should format date in human-readable format", () => {
    const date = new Date("2024-01-15T14:30:00");
    const formatted = formatNextRun(date);
    expect(formatted).toContain("Jan");
    expect(formatted).toContain("15");
    expect(formatted).toMatch(TIME_FORMAT_REGEX);
  });
});

describe("CRON_EXAMPLES", () => {
  it("should have valid examples", () => {
    for (const example of CRON_EXAMPLES) {
      const result = parseCron(example.expression);
      expect(result.isValid).toBe(true);
    }
  });

  it("should have unique expressions", () => {
    const expressions = CRON_EXAMPLES.map((e) => e.expression);
    const unique = [...new Set(expressions)];
    expect(unique).toHaveLength(expressions.length);
  });

  it("should have labels and descriptions", () => {
    for (const example of CRON_EXAMPLES) {
      expect(example.label).toBeTruthy();
      expect(example.description).toBeTruthy();
    }
  });
});
