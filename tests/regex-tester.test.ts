import { describe, expect, it } from "vitest";
import {
  createRegex,
  EXAMPLE_PATTERNS,
  escapeRegex,
  QUICK_REFERENCE,
  REGEX_FLAGS,
  substituteRegex,
  testRegex,
} from "@/lib/regex-tester";

describe("createRegex", () => {
  it("should create a valid regex from pattern and flags", () => {
    const { regex, error } = createRegex("hello", "gi");

    expect(error).toBeNull();
    expect(regex).toBeInstanceOf(RegExp);
    expect(regex?.source).toBe("hello");
    expect(regex?.flags).toBe("gi");
  });

  it("should return null regex for empty pattern", () => {
    const { regex, error } = createRegex("", "g");

    expect(error).toBeNull();
    expect(regex).toBeNull();
  });

  it("should return error for invalid regex pattern", () => {
    const { regex, error } = createRegex("[invalid", "g");

    expect(regex).toBeNull();
    expect(error).toBeTruthy();
    expect(error).toContain("Invalid");
  });

  it("should return error for invalid flags", () => {
    const { regex, error } = createRegex("hello", "xyz");

    expect(regex).toBeNull();
    expect(error).toBeTruthy();
  });

  it("should handle complex patterns", () => {
    const { regex, error } = createRegex(
      "(?<name>\\w+)@(?<domain>[\\w.]+)",
      "g"
    );

    expect(error).toBeNull();
    expect(regex).toBeInstanceOf(RegExp);
  });
});

describe("testRegex", () => {
  it("should find all matches with global flag", () => {
    const result = testRegex("\\d+", "abc 123 def 456 ghi 789", "g");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(3);
    expect(result.matches[0].fullMatch).toBe("123");
    expect(result.matches[1].fullMatch).toBe("456");
    expect(result.matches[2].fullMatch).toBe("789");
  });

  it("should find only first match without global flag", () => {
    const result = testRegex("\\d+", "abc 123 def 456", "");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].fullMatch).toBe("123");
  });

  it("should handle case insensitive flag", () => {
    const result = testRegex("hello", "Hello HELLO hello", "gi");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(3);
  });

  it("should return empty matches for no match", () => {
    const result = testRegex("xyz", "hello world", "g");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
    expect(result.matches).toHaveLength(0);
  });

  it("should capture groups correctly", () => {
    const result = testRegex("(\\w+)@(\\w+)", "test@example", "");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(1);
    expect(result.matches[0].groups).toHaveLength(2);
    expect(result.matches[0].groups[0].value).toBe("test");
    expect(result.matches[0].groups[1].value).toBe("example");
  });

  it("should capture named groups correctly", () => {
    const result = testRegex(
      "(?<user>\\w+)@(?<domain>\\w+)",
      "john@example",
      ""
    );

    expect(result.isValid).toBe(true);
    expect(result.matches[0].namedGroups.user).toBe("john");
    expect(result.matches[0].namedGroups.domain).toBe("example");
  });

  it("should return correct indices for matches", () => {
    const result = testRegex("world", "hello world", "");

    expect(result.isValid).toBe(true);
    expect(result.matches[0].index).toBe(6);
    expect(result.matches[0].endIndex).toBe(11);
  });

  it("should handle empty pattern", () => {
    const result = testRegex("", "test string", "g");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
  });

  it("should handle empty test string", () => {
    const result = testRegex("test", "", "g");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(0);
  });

  it("should return error for invalid pattern", () => {
    const result = testRegex("[unclosed", "test", "g");

    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.matchCount).toBe(0);
  });

  it("should handle multiline flag", () => {
    const result = testRegex("^line", "line1\nline2\nline3", "gm");

    expect(result.isValid).toBe(true);
    expect(result.matchCount).toBe(3);
  });

  it("should handle zero-length matches without infinite loop", () => {
    const result = testRegex("(?=a)", "aaa", "g");

    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeLessThanOrEqual(10_000);
  });

  it("should include execution time", () => {
    const result = testRegex("test", "test string", "g");

    expect(result.executionTime).toBeGreaterThanOrEqual(0);
  });
});

describe("substituteRegex", () => {
  it("should replace matches with replacement string", () => {
    const result = substituteRegex("world", "hello world", "universe", "g");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hello universe");
    expect(result.replacementCount).toBe(1);
  });

  it("should replace all matches with global flag", () => {
    const result = substituteRegex("o", "hello world", "0", "g");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hell0 w0rld");
    expect(result.replacementCount).toBe(2);
  });

  it("should replace only first match without global flag", () => {
    const result = substituteRegex("o", "hello world", "0", "");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hell0 world");
    expect(result.replacementCount).toBe(1);
  });

  it("should handle capture group references", () => {
    const result = substituteRegex(
      "(\\w+)@(\\w+)",
      "user@domain",
      "$2.$1",
      "g"
    );

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("domain.user");
  });

  it("should handle $& for full match", () => {
    const result = substituteRegex("\\d+", "value: 42", "[$&]", "g");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("value: [42]");
  });

  it("should return original string for empty pattern", () => {
    const result = substituteRegex("", "hello world", "x", "g");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hello world");
    expect(result.replacementCount).toBe(0);
  });

  it("should return error for invalid pattern", () => {
    const result = substituteRegex("[invalid", "test", "x", "g");

    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.result).toBe("test");
  });

  it("should handle empty replacement", () => {
    const result = substituteRegex("world", "hello world", "", "g");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hello ");
  });

  it("should handle case insensitive replacement", () => {
    const result = substituteRegex("hello", "Hello HELLO hello", "hi", "gi");

    expect(result.isValid).toBe(true);
    expect(result.result).toBe("hi hi hi");
    expect(result.replacementCount).toBe(3);
  });
});

describe("escapeRegex", () => {
  it("should escape special regex characters", () => {
    expect(escapeRegex("hello.world")).toBe("hello\\.world");
    expect(escapeRegex("a+b*c?")).toBe("a\\+b\\*c\\?");
    expect(escapeRegex("(test)")).toBe("\\(test\\)");
    expect(escapeRegex("[abc]")).toBe("\\[abc\\]");
    expect(escapeRegex("a|b")).toBe("a\\|b");
    expect(escapeRegex("^start$")).toBe("\\^start\\$");
    expect(escapeRegex("path\\to\\file")).toBe("path\\\\to\\\\file");
  });

  it("should not escape regular characters", () => {
    expect(escapeRegex("hello")).toBe("hello");
    expect(escapeRegex("123")).toBe("123");
    expect(escapeRegex("abc_def")).toBe("abc_def");
  });

  it("should handle empty string", () => {
    expect(escapeRegex("")).toBe("");
  });

  it("should handle multiple special characters together", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: testing special chars
    const specialChars = ".*+?^${}()|[]\\";
    expect(escapeRegex(specialChars)).toBe(
      "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\"
    );
  });
});

describe("REGEX_FLAGS", () => {
  it("should have all standard JavaScript regex flags", () => {
    const flagKeys = REGEX_FLAGS.map((f) => f.key);

    expect(flagKeys).toContain("g");
    expect(flagKeys).toContain("i");
    expect(flagKeys).toContain("m");
    expect(flagKeys).toContain("s");
    expect(flagKeys).toContain("u");
  });

  it("should have descriptions for all flags", () => {
    for (const flag of REGEX_FLAGS) {
      expect(flag.label).toBeTruthy();
      expect(flag.description).toBeTruthy();
    }
  });
});

describe("EXAMPLE_PATTERNS", () => {
  it("should have valid regex patterns", () => {
    for (const example of EXAMPLE_PATTERNS) {
      const { error } = createRegex(example.pattern, example.flags || "g");
      expect(error).toBeNull();
    }
  });

  it("should have test strings that match their patterns", () => {
    for (const example of EXAMPLE_PATTERNS) {
      const result = testRegex(
        example.pattern,
        example.testString,
        example.flags || "g"
      );
      expect(result.isValid).toBe(true);
      expect(result.matchCount).toBeGreaterThan(0);
    }
  });

  it("should have required properties", () => {
    for (const example of EXAMPLE_PATTERNS) {
      expect(example.name).toBeTruthy();
      expect(example.pattern).toBeTruthy();
      expect(example.description).toBeTruthy();
      expect(example.testString).toBeTruthy();
    }
  });
});

describe("QUICK_REFERENCE", () => {
  it("should have categories with items", () => {
    expect(QUICK_REFERENCE.length).toBeGreaterThan(0);

    for (const category of QUICK_REFERENCE) {
      expect(category.name).toBeTruthy();
      expect(category.items.length).toBeGreaterThan(0);
    }
  });

  it("should have token and description for all items", () => {
    for (const category of QUICK_REFERENCE) {
      for (const item of category.items) {
        expect(item.token).toBeTruthy();
        expect(item.description).toBeTruthy();
      }
    }
  });
});
