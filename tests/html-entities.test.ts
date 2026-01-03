import { describe, expect, it } from "vitest";
import {
  commonEntities,
  containsHTMLEntities,
  decodeHTMLEntities,
  encodeHTMLEntities,
  findEntities,
} from "@/lib/html-entities";

describe("encodeHTMLEntities", () => {
  describe("named mode", () => {
    it("should encode ampersand as &amp;", () => {
      const result = encodeHTMLEntities("Tom & Jerry", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Tom &amp; Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should encode less than as &lt;", () => {
      const result = encodeHTMLEntities("1 < 2", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("1 &lt; 2");
      expect(result.isValid).toBe(true);
    });

    it("should encode greater than as &gt;", () => {
      const result = encodeHTMLEntities("2 > 1", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("2 &gt; 1");
      expect(result.isValid).toBe(true);
    });

    it("should encode double quotes as &quot;", () => {
      const result = encodeHTMLEntities('Say "Hello"', {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Say &quot;Hello&quot;");
      expect(result.isValid).toBe(true);
    });

    it("should encode apostrophe as &apos;", () => {
      const result = encodeHTMLEntities("It's fine", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("It&apos;s fine");
      expect(result.isValid).toBe(true);
    });

    it("should encode copyright symbol", () => {
      const result = encodeHTMLEntities("© 2024", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("&copy; 2024");
      expect(result.isValid).toBe(true);
    });

    it("should encode HTML tag characters", () => {
      const result = encodeHTMLEntities("<script>alert('xss')</script>", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe(
        "&lt;script&gt;alert(&apos;xss&apos;)&lt;/script&gt;"
      );
      expect(result.isValid).toBe(true);
    });

    it("should encode accented characters", () => {
      const result = encodeHTMLEntities("café", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("caf&eacute;");
      expect(result.isValid).toBe(true);
    });

    it("should handle empty string", () => {
      const result = encodeHTMLEntities("", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("");
      expect(result.isValid).toBe(true);
    });

    it("should not encode plain alphanumeric text", () => {
      const result = encodeHTMLEntities("Hello World 123", {
        mode: "named",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Hello World 123");
      expect(result.isValid).toBe(true);
    });
  });

  describe("decimal mode", () => {
    it("should encode ampersand as &#38;", () => {
      const result = encodeHTMLEntities("Tom & Jerry", {
        mode: "decimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Tom &#38; Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should encode less than as &#60;", () => {
      const result = encodeHTMLEntities("<tag>", {
        mode: "decimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("&#60;tag&#62;");
      expect(result.isValid).toBe(true);
    });

    it("should encode emoji as decimal code point", () => {
      const result = encodeHTMLEntities("Hello 👋", {
        mode: "decimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Hello &#128075;");
      expect(result.isValid).toBe(true);
    });
  });

  describe("hexadecimal mode", () => {
    it("should encode ampersand as &#x26;", () => {
      const result = encodeHTMLEntities("Tom & Jerry", {
        mode: "hexadecimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Tom &#x26; Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should encode less than as &#x3C;", () => {
      const result = encodeHTMLEntities("<tag>", {
        mode: "hexadecimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("&#x3C;tag&#x3E;");
      expect(result.isValid).toBe(true);
    });

    it("should encode emoji as hex code point", () => {
      const result = encodeHTMLEntities("Hi 🚀", {
        mode: "hexadecimal",
        encodeAll: false,
      });
      expect(result.encoded).toBe("Hi &#x1F680;");
      expect(result.isValid).toBe(true);
    });
  });

  describe("encodeAll option", () => {
    it("should encode all non-alphanumeric when encodeAll is true", () => {
      const result = encodeHTMLEntities("a-b", {
        mode: "decimal",
        encodeAll: true,
      });
      expect(result.encoded).toBe("a&#45;b");
      expect(result.isValid).toBe(true);
    });

    it("should encode spaces when encodeAll is true", () => {
      const result = encodeHTMLEntities("hello world", {
        mode: "named",
        encodeAll: true,
      });
      expect(result.encoded).toBe("hello&nbsp;world");
      expect(result.isValid).toBe(true);
    });

    it("should not encode letters and numbers when encodeAll is true", () => {
      const result = encodeHTMLEntities("abc123", {
        mode: "decimal",
        encodeAll: true,
      });
      expect(result.encoded).toBe("abc123");
      expect(result.isValid).toBe(true);
    });
  });
});

describe("decodeHTMLEntities", () => {
  describe("named entities", () => {
    it("should decode &amp; to ampersand", () => {
      const result = decodeHTMLEntities("Tom &amp; Jerry");
      expect(result.decoded).toBe("Tom & Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should decode &lt; to less than", () => {
      const result = decodeHTMLEntities("1 &lt; 2");
      expect(result.decoded).toBe("1 < 2");
      expect(result.isValid).toBe(true);
    });

    it("should decode &gt; to greater than", () => {
      const result = decodeHTMLEntities("2 &gt; 1");
      expect(result.decoded).toBe("2 > 1");
      expect(result.isValid).toBe(true);
    });

    it("should decode &quot; to double quote", () => {
      const result = decodeHTMLEntities("Say &quot;Hello&quot;");
      expect(result.decoded).toBe('Say "Hello"');
      expect(result.isValid).toBe(true);
    });

    it("should decode &apos; to apostrophe", () => {
      const result = decodeHTMLEntities("It&apos;s fine");
      expect(result.decoded).toBe("It's fine");
      expect(result.isValid).toBe(true);
    });

    it("should decode &copy; to copyright symbol", () => {
      const result = decodeHTMLEntities("&copy; 2024");
      expect(result.decoded).toBe("© 2024");
      expect(result.isValid).toBe(true);
    });

    it("should decode &nbsp; to space", () => {
      const result = decodeHTMLEntities("hello&nbsp;world");
      expect(result.decoded).toBe("hello world");
      expect(result.isValid).toBe(true);
    });

    it("should decode currency symbols", () => {
      const result = decodeHTMLEntities("&euro;100 &pound;50 &yen;1000");
      expect(result.decoded).toBe("€100 £50 ¥1000");
      expect(result.isValid).toBe(true);
    });

    it("should decode arrow entities", () => {
      const result = decodeHTMLEntities("&larr; &rarr; &uarr; &darr;");
      expect(result.decoded).toBe("← → ↑ ↓");
      expect(result.isValid).toBe(true);
    });

    it("should preserve unknown named entities", () => {
      const result = decodeHTMLEntities("&unknown;");
      expect(result.decoded).toBe("&unknown;");
      expect(result.isValid).toBe(true);
    });
  });

  describe("decimal entities", () => {
    it("should decode &#38; to ampersand", () => {
      const result = decodeHTMLEntities("Tom &#38; Jerry");
      expect(result.decoded).toBe("Tom & Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should decode &#60; to less than", () => {
      const result = decodeHTMLEntities("&#60;tag&#62;");
      expect(result.decoded).toBe("<tag>");
      expect(result.isValid).toBe(true);
    });

    it("should decode &#128075; to wave emoji", () => {
      const result = decodeHTMLEntities("Hello &#128075;");
      expect(result.decoded).toBe("Hello 👋");
      expect(result.isValid).toBe(true);
    });

    it("should preserve invalid decimal entities", () => {
      const result = decodeHTMLEntities("&#abc;");
      expect(result.decoded).toBe("&#abc;");
      expect(result.isValid).toBe(true);
    });
  });

  describe("hexadecimal entities", () => {
    it("should decode &#x26; to ampersand", () => {
      const result = decodeHTMLEntities("Tom &#x26; Jerry");
      expect(result.decoded).toBe("Tom & Jerry");
      expect(result.isValid).toBe(true);
    });

    it("should decode &#x3C; to less than", () => {
      const result = decodeHTMLEntities("&#x3C;tag&#x3E;");
      expect(result.decoded).toBe("<tag>");
      expect(result.isValid).toBe(true);
    });

    it("should decode &#x1F680; to rocket emoji", () => {
      const result = decodeHTMLEntities("Hi &#x1F680;");
      expect(result.decoded).toBe("Hi 🚀");
      expect(result.isValid).toBe(true);
    });

    it("should handle uppercase X", () => {
      const result = decodeHTMLEntities("&#X26;");
      expect(result.decoded).toBe("&");
      expect(result.isValid).toBe(true);
    });

    it("should handle lowercase hex digits", () => {
      const result = decodeHTMLEntities("&#x3c;");
      expect(result.decoded).toBe("<");
      expect(result.isValid).toBe(true);
    });

    it("should handle uppercase hex digits", () => {
      const result = decodeHTMLEntities("&#x3C;");
      expect(result.decoded).toBe("<");
      expect(result.isValid).toBe(true);
    });
  });

  describe("mixed entities", () => {
    it("should decode mixed named and numeric entities", () => {
      const result = decodeHTMLEntities("&lt;div&gt; &#38; &#x26;");
      expect(result.decoded).toBe("<div> & &");
      expect(result.isValid).toBe(true);
    });

    it("should handle empty string", () => {
      const result = decodeHTMLEntities("");
      expect(result.decoded).toBe("");
      expect(result.isValid).toBe(true);
    });

    it("should handle text without entities", () => {
      const result = decodeHTMLEntities("Hello World");
      expect(result.decoded).toBe("Hello World");
      expect(result.isValid).toBe(true);
    });
  });
});

describe("roundtrip encoding/decoding", () => {
  const testCases = [
    "Hello & World",
    '<script>alert("XSS")</script>',
    "© 2024 Company™",
    "Price: €100 or £80",
    "café résumé naïve",
    "→ Next → Step →",
    "a < b && b > c",
    "Say \"Hello\" or 'Hi'",
    "α + β = γ",
    "Hello 👋 World 🌍",
  ];

  testCases.forEach((input) => {
    it(`should roundtrip: "${input.slice(0, 30)}${input.length > 30 ? "..." : ""}"`, () => {
      const encoded = encodeHTMLEntities(input, {
        mode: "named",
        encodeAll: false,
      });
      const decoded = decodeHTMLEntities(encoded.encoded);
      expect(decoded.decoded).toBe(input);
    });
  });

  testCases.forEach((input) => {
    it(`should roundtrip decimal: "${input.slice(0, 30)}${input.length > 30 ? "..." : ""}"`, () => {
      const encoded = encodeHTMLEntities(input, {
        mode: "decimal",
        encodeAll: false,
      });
      const decoded = decodeHTMLEntities(encoded.encoded);
      expect(decoded.decoded).toBe(input);
    });
  });

  testCases.forEach((input) => {
    it(`should roundtrip hex: "${input.slice(0, 30)}${input.length > 30 ? "..." : ""}"`, () => {
      const encoded = encodeHTMLEntities(input, {
        mode: "hexadecimal",
        encodeAll: false,
      });
      const decoded = decodeHTMLEntities(encoded.encoded);
      expect(decoded.decoded).toBe(input);
    });
  });
});

describe("containsHTMLEntities", () => {
  it("should detect named entities", () => {
    expect(containsHTMLEntities("Hello &amp; World")).toBe(true);
    expect(containsHTMLEntities("&lt;div&gt;")).toBe(true);
  });

  it("should detect decimal entities", () => {
    expect(containsHTMLEntities("Hello &#38; World")).toBe(true);
    expect(containsHTMLEntities("&#60;tag&#62;")).toBe(true);
  });

  it("should detect hexadecimal entities", () => {
    expect(containsHTMLEntities("Hello &#x26; World")).toBe(true);
    expect(containsHTMLEntities("&#x3C;tag&#x3E;")).toBe(true);
  });

  it("should return false for plain text", () => {
    expect(containsHTMLEntities("Hello World")).toBe(false);
    expect(containsHTMLEntities("No entities here")).toBe(false);
  });

  it("should return false for incomplete entities", () => {
    expect(containsHTMLEntities("Tom & Jerry")).toBe(false);
    expect(containsHTMLEntities("&#")).toBe(false);
  });
});

describe("findEntities", () => {
  it("should find named entities", () => {
    const entities = findEntities("Hello &amp; World");
    expect(entities).toHaveLength(1);
    expect(entities[0]).toEqual({
      entity: "&amp;",
      decoded: "&",
      type: "named",
      position: 6,
    });
  });

  it("should find decimal entities", () => {
    const entities = findEntities("Hello &#38; World");
    expect(entities).toHaveLength(1);
    expect(entities[0]).toEqual({
      entity: "&#38;",
      decoded: "&",
      type: "decimal",
      position: 6,
    });
  });

  it("should find hexadecimal entities", () => {
    const entities = findEntities("Hello &#x26; World");
    expect(entities).toHaveLength(1);
    expect(entities[0]).toEqual({
      entity: "&#x26;",
      decoded: "&",
      type: "hexadecimal",
      position: 6,
    });
  });

  it("should find multiple entities and sort by position", () => {
    const entities = findEntities("&lt;div&gt; &#38; &#x26;");
    expect(entities).toHaveLength(4);
    expect(entities[0].entity).toBe("&lt;");
    expect(entities[1].entity).toBe("&gt;");
    expect(entities[2].entity).toBe("&#38;");
    expect(entities[3].entity).toBe("&#x26;");
  });

  it("should return empty array for text without entities", () => {
    const entities = findEntities("Hello World");
    expect(entities).toHaveLength(0);
  });
});

describe("commonEntities", () => {
  it("should have essential entities", () => {
    const chars = commonEntities.map((e) => e.char);
    expect(chars).toContain("&");
    expect(chars).toContain("<");
    expect(chars).toContain(">");
    expect(chars).toContain('"');
    expect(chars).toContain("'");
    expect(chars).toContain("©");
  });

  it("should have valid entity mappings", () => {
    for (const { char, entity } of commonEntities) {
      const encoded = encodeHTMLEntities(char, {
        mode: "named",
        encodeAll: true,
      });
      expect(encoded.encoded).toBe(entity);
    }
  });
});
