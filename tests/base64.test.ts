import { describe, expect, it } from "vitest";
import {
  calculateSizeInfo,
  decodeBase64,
  encodeBase64,
  isValidBase64,
} from "@/lib/base64";

describe("encodeBase64 - Standard Mode", () => {
  it("should encode empty string", () => {
    const result = encodeBase64("");
    expect(result.success).toBe(true);
    expect(result.data).toBe("");
  });

  it("should encode simple text", () => {
    const result = encodeBase64("Hello, World!");
    expect(result.success).toBe(true);
    expect(result.data).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("should encode 'Man'", () => {
    const result = encodeBase64("Man");
    expect(result.success).toBe(true);
    expect(result.data).toBe("TWFu");
  });

  it("should encode single character", () => {
    const result = encodeBase64("A");
    expect(result.success).toBe(true);
    expect(result.data).toBe("QQ==");
  });

  it("should encode two characters", () => {
    const result = encodeBase64("AB");
    expect(result.success).toBe(true);
    expect(result.data).toBe("QUI=");
  });

  it("should encode unicode characters", () => {
    const result = encodeBase64("café");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Y2Fmw6k=");
  });

  it("should encode emoji", () => {
    const result = encodeBase64("👋");
    expect(result.success).toBe(true);
    expect(result.data).toBe("8J+Riw==");
  });

  it("should encode Chinese characters", () => {
    const result = encodeBase64("你好");
    expect(result.success).toBe(true);
    expect(result.data).toBe("5L2g5aW9");
  });

  it("should encode JSON", () => {
    const result = encodeBase64('{"name":"John","age":30}');
    expect(result.success).toBe(true);
    expect(result.data).toBe("eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9");
  });

  it("should encode text with newlines", () => {
    const result = encodeBase64("line1\nline2");
    expect(result.success).toBe(true);
    expect(result.data).toBe("bGluZTEKbGluZTI=");
  });

  it("should encode text with special characters", () => {
    const result = encodeBase64("a+b/c=d");
    expect(result.success).toBe(true);
    expect(result.data).toBe("YStiL2M9ZA==");
  });
});

describe("encodeBase64 - URL-Safe Mode", () => {
  it("should encode without padding", () => {
    const result = encodeBase64("A", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).toBe("QQ");
    expect(result.data).not.toContain("=");
  });

  it("should replace + with -", () => {
    // A string that produces + in standard base64
    const result = encodeBase64("???", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).not.toContain("+");
  });

  it("should replace / with _", () => {
    // A string that produces / in standard base64
    const result = encodeBase64("????", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).not.toContain("/");
  });

  it("should encode simple text in url-safe mode", () => {
    const result = encodeBase64("Hello, World!", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).toBe("SGVsbG8sIFdvcmxkIQ");
  });
});

describe("decodeBase64 - Standard Mode", () => {
  it("should decode empty string", () => {
    const result = decodeBase64("");
    expect(result.success).toBe(true);
    expect(result.data).toBe("");
  });

  it("should decode simple text", () => {
    const result = decodeBase64("SGVsbG8sIFdvcmxkIQ==");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Hello, World!");
  });

  it("should decode 'TWFu'", () => {
    const result = decodeBase64("TWFu");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Man");
  });

  it("should decode unicode", () => {
    const result = decodeBase64("Y2Fmw6k=");
    expect(result.success).toBe(true);
    expect(result.data).toBe("café");
  });

  it("should decode emoji", () => {
    const result = decodeBase64("8J+Riw==");
    expect(result.success).toBe(true);
    expect(result.data).toBe("👋");
  });

  it("should decode Chinese characters", () => {
    const result = decodeBase64("5L2g5aW9");
    expect(result.success).toBe(true);
    expect(result.data).toBe("你好");
  });

  it("should decode JSON", () => {
    const result = decodeBase64("eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9");
    expect(result.success).toBe(true);
    expect(result.data).toBe('{"name":"John","age":30}');
  });

  it("should handle invalid base64", () => {
    const result = decodeBase64("!!!invalid!!!");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle incomplete base64", () => {
    const result = decodeBase64("SGVsbG8");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Hello");
  });
});

describe("decodeBase64 - URL-Safe Mode", () => {
  it("should decode url-safe base64 without padding", () => {
    const result = decodeBase64("QQ", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).toBe("A");
  });

  it("should decode url-safe base64 with - and _", () => {
    // Standard: SGVsbG8sIFdvcmxkIQ==
    // URL-Safe: SGVsbG8sIFdvcmxkIQ
    const result = decodeBase64("SGVsbG8sIFdvcmxkIQ", "url-safe");
    expect(result.success).toBe(true);
    expect(result.data).toBe("Hello, World!");
  });

  it("should decode url-safe base64 with replaced characters", () => {
    // Create a test case where standard has + and /
    const result = decodeBase64("Pz8_Pw", "url-safe");
    expect(result.success).toBe(true);
  });
});

describe("encode/decode roundtrip", () => {
  const testCases = [
    "Hello, World!",
    "Man",
    "café résumé naïve",
    '{"name":"John","age":30}',
    "👋🌍🚀",
    "你好世界",
    "line1\nline2\ttab",
    "a+b/c=d",
    "The quick brown fox jumps over the lazy dog",
    "1234567890",
    "!@#$%^&*()",
    " ", // single space
    "   ", // multiple spaces
  ];

  testCases.forEach((input) => {
    it(`should roundtrip standard mode: "${input.slice(0, 20)}${input.length > 20 ? "..." : ""}"`, () => {
      const encoded = encodeBase64(input, "standard");
      expect(encoded.success).toBe(true);
      const decoded = decodeBase64(encoded.data, "standard");
      expect(decoded.success).toBe(true);
      expect(decoded.data).toBe(input);
    });

    it(`should roundtrip url-safe mode: "${input.slice(0, 20)}${input.length > 20 ? "..." : ""}"`, () => {
      const encoded = encodeBase64(input, "url-safe");
      expect(encoded.success).toBe(true);
      const decoded = decodeBase64(encoded.data, "url-safe");
      expect(decoded.success).toBe(true);
      expect(decoded.data).toBe(input);
    });
  });
});

describe("isValidBase64", () => {
  it("should return true for empty string", () => {
    expect(isValidBase64("")).toBe(true);
  });

  it("should return true for valid base64", () => {
    expect(isValidBase64("SGVsbG8=")).toBe(true);
  });

  it("should return true for base64 without padding", () => {
    expect(isValidBase64("SGVsbG8")).toBe(true);
  });

  it("should return false for invalid characters in standard mode", () => {
    expect(isValidBase64("Hello-World_")).toBe(false);
  });

  it("should return true for url-safe characters in url-safe mode", () => {
    expect(isValidBase64("SGVsbG8", "url-safe")).toBe(true);
  });

  it("should return false for completely invalid string", () => {
    expect(isValidBase64("!!!")).toBe(false);
  });
});

describe("calculateSizeInfo", () => {
  it("should calculate size for empty strings", () => {
    const result = calculateSizeInfo("", "");
    expect(result.originalBytes).toBe(0);
    expect(result.encodedBytes).toBe(0);
    expect(result.ratio).toBe("0%");
    expect(result.increase).toBe(0);
  });

  it("should calculate size for simple text", () => {
    const original = "Man";
    const encoded = "TWFu";
    const result = calculateSizeInfo(original, encoded);
    expect(result.originalBytes).toBe(3);
    expect(result.encodedBytes).toBe(4);
    expect(result.increase).toBe(1);
  });

  it("should calculate correct ratio", () => {
    const original = "Hello, World!";
    const encoded = "SGVsbG8sIFdvcmxkIQ==";
    const result = calculateSizeInfo(original, encoded);
    expect(result.originalBytes).toBe(13);
    expect(result.encodedBytes).toBe(20);
    // Ratio should be around 153.8%
    expect(Number.parseFloat(result.ratio)).toBeGreaterThan(100);
  });

  it("should handle unicode correctly", () => {
    const original = "👋";
    const result = calculateSizeInfo(original, "8J+Riw==");
    // Emoji is 4 bytes in UTF-8
    expect(result.originalBytes).toBe(4);
  });
});
