import { describe, expect, it } from "vitest";
import { createDiff, diffExamples, normalizeForDiff } from "@/lib/diff-viewer";

describe("createDiff", () => {
  it("detects line additions and deletions", () => {
    const result = createDiff("one\ntwo\n", "one\nthree\n");

    expect(result.hasChanges).toBe(true);
    expect(result.stats.additions).toBe(1);
    expect(result.stats.deletions).toBe(1);
    expect(result.patch).toContain("--- Original");
    expect(result.patch).toContain("+++ Modified");
  });

  it("returns unchanged status for identical input", () => {
    const result = createDiff("same", "same");

    expect(result.hasChanges).toBe(false);
    expect(result.stats.additions).toBe(0);
    expect(result.stats.deletions).toBe(0);
  });

  it("supports word granularity", () => {
    const result = createDiff("hello world", "hello there", "words");

    expect(result.hasChanges).toBe(true);
    expect(result.stats.additions).toBeGreaterThan(0);
    expect(result.stats.deletions).toBeGreaterThan(0);
  });

  it("omits line numbers for word-granularity segments", () => {
    const result = createDiff("hello world", "hello there", "words");

    for (const segment of result.segments) {
      expect(segment.oldLineNumber).toBeNull();
      expect(segment.newLineNumber).toBeNull();
    }
  });

  it("numbers line-granularity segments per line", () => {
    const result = createDiff("one\ntwo\n", "one\nthree\n");
    const removed = result.segments.find((s) => s.type === "removed");
    const added = result.segments.find((s) => s.type === "added");

    expect(removed?.oldLineNumber).toBe(2);
    expect(removed?.newLineNumber).toBeNull();
    expect(added?.newLineNumber).toBe(2);
    expect(added?.oldLineNumber).toBeNull();
  });

  it("normalizes trailing whitespace when requested", () => {
    expect(
      normalizeForDiff("hello  \nworld\t", { trimTrailingWhitespace: true })
    ).toBe("hello\nworld");
  });

  it("ships useful example content", () => {
    expect(diffExamples.original).toContain("formatUser");
    expect(diffExamples.modified).toContain("retries");
  });
});
