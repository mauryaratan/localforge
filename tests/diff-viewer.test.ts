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
