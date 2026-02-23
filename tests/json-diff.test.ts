import { describe, expect, it } from "vitest";
import {
  compareJson,
  formatValue,
  generateUnifiedDiff,
  validateJson,
} from "@/lib/json-diff";

describe("json-diff", () => {
  describe("validateJson", () => {
    it("should return valid for correct JSON", () => {
      const result = validateJson('{"name": "test"}');
      expect(result.isValid).toBe(true);
      expect(result.parsed).toEqual({ name: "test" });
    });

    it("should return invalid for empty input", () => {
      const result = validateJson("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Input is empty");
    });

    it("should return invalid for malformed JSON", () => {
      const result = validateJson('{"name": }');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle arrays", () => {
      const result = validateJson("[1, 2, 3]");
      expect(result.isValid).toBe(true);
      expect(result.parsed).toEqual([1, 2, 3]);
    });

    it("should handle nested objects", () => {
      const result = validateJson('{"a": {"b": {"c": 1}}}');
      expect(result.isValid).toBe(true);
      expect(result.parsed).toEqual({ a: { b: { c: 1 } } });
    });
  });

  describe("formatValue", () => {
    it("should format strings with quotes", () => {
      expect(formatValue("hello")).toBe('"hello"');
    });

    it("should format null", () => {
      expect(formatValue(null)).toBe("null");
    });

    it("should format undefined", () => {
      expect(formatValue(undefined)).toBe("undefined");
    });

    it("should format numbers", () => {
      expect(formatValue(42)).toBe("42");
    });

    it("should format booleans", () => {
      expect(formatValue(true)).toBe("true");
      expect(formatValue(false)).toBe("false");
    });

    it("should format arrays with length", () => {
      expect(formatValue([1, 2, 3])).toBe("Array[3]");
    });

    it("should format objects with key count", () => {
      expect(formatValue({ a: 1, b: 2 })).toBe("Object{2}");
    });
  });

  describe("compareJson", () => {
    it("should return error for invalid original JSON", () => {
      const result = compareJson("invalid", '{"valid": true}');
      expect(result.success).toBe(false);
      expect(result.error).toContain("Original JSON");
    });

    it("should return error for invalid modified JSON", () => {
      const result = compareJson('{"valid": true}', "invalid");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Modified JSON");
    });

    it("should detect added keys", () => {
      const result = compareJson('{"a": 1}', '{"a": 1, "b": 2}');
      expect(result.success).toBe(true);
      expect(result.summary.added).toBe(1);
      expect(result.diffs.find((d) => d.type === "added")?.key).toBe("b");
    });

    it("should detect removed keys", () => {
      const result = compareJson('{"a": 1, "b": 2}', '{"a": 1}');
      expect(result.success).toBe(true);
      expect(result.summary.removed).toBe(1);
      expect(result.diffs.find((d) => d.type === "removed")?.key).toBe("b");
    });

    it("should detect changed values", () => {
      const result = compareJson('{"a": 1}', '{"a": 2}');
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
      const changed = result.diffs.find((d) => d.type === "changed");
      expect(changed?.oldValue).toBe(1);
      expect(changed?.newValue).toBe(2);
    });

    it("should detect unchanged values", () => {
      const result = compareJson('{"a": 1}', '{"a": 1}');
      expect(result.success).toBe(true);
      expect(result.summary.unchanged).toBe(1);
      expect(result.summary.changed).toBe(0);
    });

    it("should handle nested objects", () => {
      const original = '{"user": {"name": "John", "age": 30}}';
      const modified = '{"user": {"name": "John", "age": 31}}';
      const result = compareJson(original, modified);
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
      const changed = result.diffs.find((d) => d.type === "changed");
      expect(changed?.path).toBe("$.user.age");
    });

    it("should handle arrays", () => {
      const original = '{"items": [1, 2, 3]}';
      const modified = '{"items": [1, 2, 4]}';
      const result = compareJson(original, modified);
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
      const changed = result.diffs.find((d) => d.type === "changed");
      expect(changed?.path).toBe("$.items[2]");
    });

    it("should handle array length changes", () => {
      const original = '{"items": [1, 2]}';
      const modified = '{"items": [1, 2, 3]}';
      const result = compareJson(original, modified);
      expect(result.success).toBe(true);
      expect(result.summary.added).toBe(1);
    });

    it("should handle type changes", () => {
      const result = compareJson('{"a": "1"}', '{"a": 1}');
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
      const changed = result.diffs.find((d) => d.type === "changed");
      expect(changed?.oldValue).toBe("1");
      expect(changed?.newValue).toBe(1);
    });

    it("should handle null values", () => {
      const result = compareJson('{"a": null}', '{"a": "value"}');
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
    });

    it("should handle empty objects", () => {
      const result = compareJson("{}", "{}");
      expect(result.success).toBe(true);
      expect(result.summary.added).toBe(0);
      expect(result.summary.removed).toBe(0);
      expect(result.summary.changed).toBe(0);
    });

    it("should handle deeply nested changes", () => {
      const original = '{"a": {"b": {"c": {"d": 1}}}}';
      const modified = '{"a": {"b": {"c": {"d": 2}}}}';
      const result = compareJson(original, modified);
      expect(result.success).toBe(true);
      expect(result.summary.changed).toBe(1);
      const changed = result.diffs.find((d) => d.type === "changed");
      expect(changed?.path).toBe("$.a.b.c.d");
    });
  });

  describe("generateUnifiedDiff", () => {
    it("should generate diff output for added items", () => {
      const diffs = [
        {
          type: "added" as const,
          path: "$.b",
          key: "b",
          newValue: 2,
          depth: 1,
        },
      ];
      const output = generateUnifiedDiff(diffs);
      expect(output).toContain("+");
      expect(output).toContain("$.b");
    });

    it("should generate diff output for removed items", () => {
      const diffs = [
        {
          type: "removed" as const,
          path: "$.a",
          key: "a",
          oldValue: 1,
          depth: 1,
        },
      ];
      const output = generateUnifiedDiff(diffs);
      expect(output).toContain("-");
      expect(output).toContain("$.a");
    });

    it("should generate diff output for changed items", () => {
      const diffs = [
        {
          type: "changed" as const,
          path: "$.a",
          key: "a",
          oldValue: 1,
          newValue: 2,
          depth: 1,
        },
      ];
      const output = generateUnifiedDiff(diffs);
      expect(output).toContain("~");
      expect(output).toContain("→");
    });

    it("should not include unchanged items", () => {
      const diffs = [
        {
          type: "unchanged" as const,
          path: "$.a",
          key: "a",
          oldValue: 1,
          newValue: 1,
          depth: 1,
        },
      ];
      const output = generateUnifiedDiff(diffs);
      expect(output).toBe("");
    });
  });
});
