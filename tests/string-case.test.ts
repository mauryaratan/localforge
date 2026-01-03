import { describe, expect, it } from "vitest";
import {
  convertCase,
  detectCase,
  getCharacterCount,
  getWordCount,
  splitIntoWords,
  toCamelCase,
  toCapitalizedCase,
  toConstantCase,
  toDotCase,
  toFlatCase,
  toKebabCase,
  toLowerCase,
  toPathCase,
  toPascalCase,
  toScreamingKebab,
  toSentenceCase,
  toSlugCase,
  toSnakeCase,
  toSwapCase,
  toTitleCase,
  toTrainCase,
  toUpperCase,
  toUpperFlatCase,
} from "@/lib/string-case";

describe("splitIntoWords", () => {
  it("should split camelCase", () => {
    expect(splitIntoWords("getUserAccount")).toEqual([
      "get",
      "User",
      "Account",
    ]);
  });

  it("should split PascalCase", () => {
    expect(splitIntoWords("UserAccountManager")).toEqual([
      "User",
      "Account",
      "Manager",
    ]);
  });

  it("should split snake_case", () => {
    expect(splitIntoWords("user_account_manager")).toEqual([
      "user",
      "account",
      "manager",
    ]);
  });

  it("should split kebab-case", () => {
    expect(splitIntoWords("user-account-manager")).toEqual([
      "user",
      "account",
      "manager",
    ]);
  });

  it("should split CONSTANT_CASE", () => {
    expect(splitIntoWords("MAX_RETRY_COUNT")).toEqual([
      "MAX",
      "RETRY",
      "COUNT",
    ]);
  });

  it("should split dot.case", () => {
    expect(splitIntoWords("user.account.manager")).toEqual([
      "user",
      "account",
      "manager",
    ]);
  });

  it("should split path/case", () => {
    expect(splitIntoWords("src/components/Button")).toEqual([
      "src",
      "components",
      "Button",
    ]);
  });

  it("should handle spaces", () => {
    expect(splitIntoWords("Hello World")).toEqual(["Hello", "World"]);
  });

  it("should handle mixed separators", () => {
    expect(splitIntoWords("hello_world-test.case")).toEqual([
      "hello",
      "world",
      "test",
      "case",
    ]);
  });

  it("should return empty array for empty input", () => {
    expect(splitIntoWords("")).toEqual([]);
    expect(splitIntoWords("   ")).toEqual([]);
  });

  it("should handle acronyms in camelCase", () => {
    expect(splitIntoWords("parseXMLDocument")).toEqual([
      "parse",
      "XML",
      "Document",
    ]);
  });
});

describe("toCamelCase", () => {
  it("should convert space-separated words", () => {
    expect(toCamelCase("hello world")).toBe("helloWorld");
  });

  it("should convert from PascalCase", () => {
    expect(toCamelCase("HelloWorld")).toBe("helloWorld");
  });

  it("should convert from snake_case", () => {
    expect(toCamelCase("hello_world")).toBe("helloWorld");
  });

  it("should convert from kebab-case", () => {
    expect(toCamelCase("hello-world")).toBe("helloWorld");
  });

  it("should convert from CONSTANT_CASE", () => {
    expect(toCamelCase("HELLO_WORLD")).toBe("helloWorld");
  });

  it("should handle single word", () => {
    expect(toCamelCase("hello")).toBe("hello");
    expect(toCamelCase("HELLO")).toBe("hello");
  });

  it("should handle empty input", () => {
    expect(toCamelCase("")).toBe("");
  });
});

describe("toPascalCase", () => {
  it("should convert space-separated words", () => {
    expect(toPascalCase("hello world")).toBe("HelloWorld");
  });

  it("should convert from camelCase", () => {
    expect(toPascalCase("helloWorld")).toBe("HelloWorld");
  });

  it("should convert from snake_case", () => {
    expect(toPascalCase("hello_world")).toBe("HelloWorld");
  });

  it("should convert from kebab-case", () => {
    expect(toPascalCase("hello-world")).toBe("HelloWorld");
  });

  it("should handle single word", () => {
    expect(toPascalCase("hello")).toBe("Hello");
  });
});

describe("toSnakeCase", () => {
  it("should convert space-separated words", () => {
    expect(toSnakeCase("hello world")).toBe("hello_world");
  });

  it("should convert from camelCase", () => {
    expect(toSnakeCase("helloWorld")).toBe("hello_world");
  });

  it("should convert from PascalCase", () => {
    expect(toSnakeCase("HelloWorld")).toBe("hello_world");
  });

  it("should convert from kebab-case", () => {
    expect(toSnakeCase("hello-world")).toBe("hello_world");
  });

  it("should handle CONSTANT_CASE", () => {
    expect(toSnakeCase("HELLO_WORLD")).toBe("hello_world");
  });
});

describe("toKebabCase", () => {
  it("should convert space-separated words", () => {
    expect(toKebabCase("hello world")).toBe("hello-world");
  });

  it("should convert from camelCase", () => {
    expect(toKebabCase("helloWorld")).toBe("hello-world");
  });

  it("should convert from PascalCase", () => {
    expect(toKebabCase("HelloWorld")).toBe("hello-world");
  });

  it("should convert from snake_case", () => {
    expect(toKebabCase("hello_world")).toBe("hello-world");
  });
});

describe("toScreamingKebab", () => {
  it("should convert to SCREAMING-KEBAB", () => {
    expect(toScreamingKebab("hello world")).toBe("HELLO-WORLD");
  });

  it("should convert from camelCase", () => {
    expect(toScreamingKebab("helloWorld")).toBe("HELLO-WORLD");
  });
});

describe("toConstantCase", () => {
  it("should convert to CONSTANT_CASE", () => {
    expect(toConstantCase("hello world")).toBe("HELLO_WORLD");
  });

  it("should convert from camelCase", () => {
    expect(toConstantCase("helloWorld")).toBe("HELLO_WORLD");
  });

  it("should convert from kebab-case", () => {
    expect(toConstantCase("hello-world")).toBe("HELLO_WORLD");
  });
});

describe("toUpperCase", () => {
  it("should convert to upper case preserving spaces", () => {
    expect(toUpperCase("Hello World")).toBe("HELLO WORLD");
  });

  it("should handle mixed case", () => {
    expect(toUpperCase("hElLo WoRlD")).toBe("HELLO WORLD");
  });
});

describe("toLowerCase", () => {
  it("should convert to lower case preserving spaces", () => {
    expect(toLowerCase("Hello World")).toBe("hello world");
  });

  it("should handle UPPERCASE", () => {
    expect(toLowerCase("HELLO WORLD")).toBe("hello world");
  });
});

describe("toCapitalizedCase", () => {
  it("should capitalize each word", () => {
    expect(toCapitalizedCase("hello world")).toBe("Hello World");
  });

  it("should convert from camelCase", () => {
    expect(toCapitalizedCase("helloWorld")).toBe("Hello World");
  });

  it("should convert from snake_case", () => {
    expect(toCapitalizedCase("hello_world")).toBe("Hello World");
  });
});

describe("toSentenceCase", () => {
  it("should capitalize only first word", () => {
    expect(toSentenceCase("hello world")).toBe("Hello world");
  });

  it("should convert from camelCase", () => {
    expect(toSentenceCase("helloWorld")).toBe("Hello world");
  });

  it("should handle all caps", () => {
    expect(toSentenceCase("HELLO WORLD")).toBe("Hello world");
  });
});

describe("toTitleCase", () => {
  it("should follow APA title case rules", () => {
    expect(toTitleCase("the quick brown fox")).toBe("The Quick Brown Fox");
  });

  it("should keep minor words lowercase (except first/last)", () => {
    expect(toTitleCase("war and peace")).toBe("War and Peace");
    expect(toTitleCase("lord of the rings")).toBe("Lord of the Rings");
  });

  it("should capitalize first and last words regardless", () => {
    expect(toTitleCase("the end")).toBe("The End");
  });

  it("should convert from camelCase", () => {
    expect(toTitleCase("quickBrownFox")).toBe("Quick Brown Fox");
  });
});

describe("toSlugCase", () => {
  it("should create URL-friendly slugs", () => {
    expect(toSlugCase("Hello World")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(toSlugCase("Hello! World?")).toBe("hello-world");
  });

  it("should convert from camelCase", () => {
    expect(toSlugCase("helloWorld")).toBe("hello-world");
  });
});

describe("toDotCase", () => {
  it("should convert to dot.case", () => {
    expect(toDotCase("hello world")).toBe("hello.world");
  });

  it("should convert from camelCase", () => {
    expect(toDotCase("helloWorld")).toBe("hello.world");
  });
});

describe("toPathCase", () => {
  it("should convert to path/case", () => {
    expect(toPathCase("hello world")).toBe("hello/world");
  });

  it("should convert from camelCase", () => {
    expect(toPathCase("helloWorld")).toBe("hello/world");
  });
});

describe("toTrainCase", () => {
  it("should convert to Train-Case", () => {
    expect(toTrainCase("hello world")).toBe("Hello-World");
  });

  it("should convert from camelCase", () => {
    expect(toTrainCase("helloWorld")).toBe("Hello-World");
  });

  it("should convert from snake_case", () => {
    expect(toTrainCase("hello_world")).toBe("Hello-World");
  });
});

describe("toFlatCase", () => {
  it("should convert to flatcase", () => {
    expect(toFlatCase("hello world")).toBe("helloworld");
  });

  it("should convert from camelCase", () => {
    expect(toFlatCase("helloWorld")).toBe("helloworld");
  });
});

describe("toUpperFlatCase", () => {
  it("should convert to UPPERFLATCASE", () => {
    expect(toUpperFlatCase("hello world")).toBe("HELLOWORLD");
  });

  it("should convert from camelCase", () => {
    expect(toUpperFlatCase("helloWorld")).toBe("HELLOWORLD");
  });
});

describe("toSwapCase", () => {
  it("should swap case of each character", () => {
    expect(toSwapCase("Hello World")).toBe("hELLO wORLD");
  });

  it("should handle all lowercase", () => {
    expect(toSwapCase("hello")).toBe("HELLO");
  });

  it("should handle all uppercase", () => {
    expect(toSwapCase("HELLO")).toBe("hello");
  });

  it("should preserve non-letters", () => {
    expect(toSwapCase("Hello123World")).toBe("hELLO123wORLD");
  });
});

describe("convertCase", () => {
  it("should convert using case type parameter", () => {
    expect(convertCase("hello world", "camelCase")).toBe("helloWorld");
    expect(convertCase("hello world", "PascalCase")).toBe("HelloWorld");
    expect(convertCase("hello world", "snake_case")).toBe("hello_world");
    expect(convertCase("hello world", "kebab-case")).toBe("hello-world");
    expect(convertCase("hello world", "CONSTANT_CASE")).toBe("HELLO_WORLD");
    expect(convertCase("hello world", "SCREAMING-KEBAB")).toBe("HELLO-WORLD");
    expect(convertCase("hello world", "UPPER CASE")).toBe("HELLO WORLD");
    expect(convertCase("hello world", "lower case")).toBe("hello world");
    expect(convertCase("hello world", "Capitalized Case")).toBe("Hello World");
    expect(convertCase("hello world", "Sentence case")).toBe("Hello world");
    expect(convertCase("hello world", "dot.case")).toBe("hello.world");
    expect(convertCase("hello world", "path/case")).toBe("hello/world");
    expect(convertCase("hello world", "Train-Case")).toBe("Hello-World");
    expect(convertCase("hello world", "flatcase")).toBe("helloworld");
    expect(convertCase("hello world", "UPPERFLATCASE")).toBe("HELLOWORLD");
    expect(convertCase("Hello World", "sWAP cASE")).toBe("hELLO wORLD");
  });
});

describe("detectCase", () => {
  it("should detect snake_case", () => {
    expect(detectCase("hello_world")).toBe("snake_case");
  });

  it("should detect CONSTANT_CASE", () => {
    expect(detectCase("HELLO_WORLD")).toBe("CONSTANT_CASE");
  });

  it("should detect kebab-case", () => {
    expect(detectCase("hello-world")).toBe("kebab-case");
  });

  it("should detect SCREAMING-KEBAB", () => {
    expect(detectCase("HELLO-WORLD")).toBe("SCREAMING-KEBAB");
  });

  it("should detect camelCase", () => {
    expect(detectCase("helloWorld")).toBe("camelCase");
  });

  it("should detect PascalCase", () => {
    expect(detectCase("HelloWorld")).toBe("PascalCase");
  });

  it("should detect dot.case", () => {
    expect(detectCase("hello.world")).toBe("dot.case");
  });

  it("should detect path/case", () => {
    expect(detectCase("hello/world")).toBe("path/case");
  });

  it("should detect Train-Case", () => {
    expect(detectCase("Hello-World")).toBe("Train-Case");
  });

  it("should return null for ambiguous or unrecognized input", () => {
    expect(detectCase("")).toBe(null);
    expect(detectCase("   ")).toBe(null);
    expect(detectCase("hello")).toBe(null);
  });
});

describe("getCharacterCount", () => {
  it("should count all characters", () => {
    expect(getCharacterCount("Hello World")).toBe(11);
  });

  it("should count without whitespace when specified", () => {
    expect(getCharacterCount("Hello World", true)).toBe(10);
  });

  it("should handle empty string", () => {
    expect(getCharacterCount("")).toBe(0);
  });
});

describe("getWordCount", () => {
  it("should count words", () => {
    expect(getWordCount("Hello World")).toBe(2);
  });

  it("should handle multiple spaces", () => {
    expect(getWordCount("Hello   World")).toBe(2);
  });

  it("should handle empty string", () => {
    expect(getWordCount("")).toBe(0);
  });

  it("should handle whitespace only", () => {
    expect(getWordCount("   ")).toBe(0);
  });
});
