import { describe, expect, it } from "vitest";
import { decodeURLComponent, encodeURLComponent } from "@/lib/url-parser";

describe("encodeURLComponent", () => {
  it("should encode space as %20", () => {
    expect(encodeURLComponent("hello world")).toBe("hello%20world");
  });

  it("should encode ampersand", () => {
    expect(encodeURLComponent("foo&bar")).toBe("foo%26bar");
  });

  it("should encode equals sign", () => {
    expect(encodeURLComponent("test=value")).toBe("test%3Dvalue");
  });

  it("should encode question mark", () => {
    expect(encodeURLComponent("what?")).toBe("what%3F");
  });

  it("should encode forward slash", () => {
    expect(encodeURLComponent("path/to/file")).toBe("path%2Fto%2Ffile");
  });

  it("should encode hash", () => {
    expect(encodeURLComponent("section#anchor")).toBe("section%23anchor");
  });

  it("should encode plus sign", () => {
    expect(encodeURLComponent("1+1")).toBe("1%2B1");
  });

  it("should encode at sign", () => {
    expect(encodeURLComponent("user@domain")).toBe("user%40domain");
  });

  it("should handle empty string", () => {
    expect(encodeURLComponent("")).toBe("");
  });

  it("should not encode alphanumeric characters", () => {
    expect(encodeURLComponent("abc123")).toBe("abc123");
  });

  it("should not encode hyphen, underscore, period, tilde", () => {
    expect(encodeURLComponent("a-b_c.d~e")).toBe("a-b_c.d~e");
  });

  it("should encode unicode characters", () => {
    expect(encodeURLComponent("café")).toBe("caf%C3%A9");
  });

  it("should encode emoji", () => {
    expect(encodeURLComponent("hello 👋")).toBe("hello%20%F0%9F%91%8B");
  });

  it("should encode multiple special characters", () => {
    expect(encodeURLComponent("a=1&b=2")).toBe("a%3D1%26b%3D2");
  });

  it("should encode full query string example", () => {
    expect(encodeURLComponent("search query with spaces")).toBe(
      "search%20query%20with%20spaces"
    );
  });

  it("should handle newlines", () => {
    expect(encodeURLComponent("line1\nline2")).toBe("line1%0Aline2");
  });

  it("should handle tabs", () => {
    expect(encodeURLComponent("col1\tcol2")).toBe("col1%09col2");
  });
});

describe("decodeURLComponent", () => {
  it("should decode %20 as space", () => {
    expect(decodeURLComponent("hello%20world")).toBe("hello world");
  });

  it("should decode ampersand", () => {
    expect(decodeURLComponent("foo%26bar")).toBe("foo&bar");
  });

  it("should decode equals sign", () => {
    expect(decodeURLComponent("test%3Dvalue")).toBe("test=value");
  });

  it("should decode question mark", () => {
    expect(decodeURLComponent("what%3F")).toBe("what?");
  });

  it("should decode forward slash", () => {
    expect(decodeURLComponent("path%2Fto%2Ffile")).toBe("path/to/file");
  });

  it("should decode hash", () => {
    expect(decodeURLComponent("section%23anchor")).toBe("section#anchor");
  });

  it("should decode plus sign", () => {
    expect(decodeURLComponent("1%2B1")).toBe("1+1");
  });

  it("should decode at sign", () => {
    expect(decodeURLComponent("user%40domain")).toBe("user@domain");
  });

  it("should handle empty string", () => {
    expect(decodeURLComponent("")).toBe("");
  });

  it("should handle already decoded string", () => {
    expect(decodeURLComponent("abc123")).toBe("abc123");
  });

  it("should decode unicode characters", () => {
    expect(decodeURLComponent("caf%C3%A9")).toBe("café");
  });

  it("should decode emoji", () => {
    expect(decodeURLComponent("hello%20%F0%9F%91%8B")).toBe("hello 👋");
  });

  it("should decode multiple special characters", () => {
    expect(decodeURLComponent("a%3D1%26b%3D2")).toBe("a=1&b=2");
  });

  it("should return original string for invalid encoding", () => {
    expect(decodeURLComponent("%ZZ")).toBe("%ZZ");
  });

  it("should return original for incomplete encoding", () => {
    expect(decodeURLComponent("%2")).toBe("%2");
  });

  it("should decode mixed valid and text", () => {
    expect(decodeURLComponent("hello%20world%21")).toBe("hello world!");
  });

  it("should decode newlines", () => {
    expect(decodeURLComponent("line1%0Aline2")).toBe("line1\nline2");
  });

  it("should decode tabs", () => {
    expect(decodeURLComponent("col1%09col2")).toBe("col1\tcol2");
  });

  it("should handle lowercase hex codes", () => {
    expect(decodeURLComponent("%2f")).toBe("/");
  });

  it("should handle uppercase hex codes", () => {
    expect(decodeURLComponent("%2F")).toBe("/");
  });
});

describe("encode/decode roundtrip", () => {
  const testCases = [
    "hello world",
    "foo&bar=baz",
    "special chars: !@#$%^&*()",
    "unicode: café résumé naïve",
    "emoji: 👋🌍🚀",
    "path/to/file?query=value#anchor",
    "email=user@example.com&name=John Doe",
    "line1\nline2\ttab",
  ];

  testCases.forEach((input) => {
    it(`should roundtrip: "${input.slice(0, 30)}..."`, () => {
      const encoded = encodeURLComponent(input);
      const decoded = decodeURLComponent(encoded);
      expect(decoded).toBe(input);
    });
  });
});
