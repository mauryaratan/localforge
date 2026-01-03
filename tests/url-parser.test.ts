import { describe, expect, it } from "vitest";
import { buildURL, parseURL } from "@/lib/url-parser";

describe("parseURL", () => {
  it("should parse a complete URL correctly", () => {
    const result = parseURL(
      "https://example.com:8080/path/to/page?foo=bar&baz=qux#section"
    );

    expect(result.isValid).toBe(true);
    expect(result.protocol).toBe("https:");
    expect(result.hostname).toBe("example.com");
    expect(result.port).toBe("8080");
    expect(result.pathname).toBe("/path/to/page");
    expect(result.search).toBe("?foo=bar&baz=qux");
    expect(result.hash).toBe("#section");
    expect(result.origin).toBe("https://example.com:8080");
    expect(result.host).toBe("example.com:8080");
  });

  it("should parse URL with default port", () => {
    const result = parseURL("https://example.com/path");

    expect(result.isValid).toBe(true);
    expect(result.port).toBe("");
    expect(result.hostname).toBe("example.com");
    expect(result.pathname).toBe("/path");
  });

  it("should extract query parameters correctly", () => {
    const result = parseURL("https://example.com?name=John&age=30&city=NYC");

    expect(result.isValid).toBe(true);
    expect(result.searchParams).toHaveLength(3);
    expect(result.searchParams[0]).toEqual({ key: "name", value: "John" });
    expect(result.searchParams[1]).toEqual({ key: "age", value: "30" });
    expect(result.searchParams[2]).toEqual({ key: "city", value: "NYC" });
  });

  it("should handle URL with no query parameters", () => {
    const result = parseURL("https://example.com/page");

    expect(result.isValid).toBe(true);
    expect(result.searchParams).toHaveLength(0);
    expect(result.search).toBe("");
  });

  it("should handle URL with hash only", () => {
    const result = parseURL("https://example.com#section");

    expect(result.isValid).toBe(true);
    expect(result.hash).toBe("#section");
    expect(result.pathname).toBe("/");
  });

  it("should handle URL with username and password", () => {
    const result = parseURL("https://user:pass@example.com/path");

    expect(result.isValid).toBe(true);
    expect(result.username).toBe("user");
    expect(result.password).toBe("pass");
  });

  it("should return error for empty string", () => {
    const result = parseURL("");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a URL");
  });

  it("should return error for whitespace only", () => {
    const result = parseURL("   ");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a URL");
  });

  it("should return error for invalid URL", () => {
    const result = parseURL("not-a-valid-url");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid URL format");
  });

  it("should handle file protocol", () => {
    const result = parseURL("file:///path/to/file.txt");

    expect(result.isValid).toBe(true);
    expect(result.protocol).toBe("file:");
    expect(result.pathname).toBe("/path/to/file.txt");
  });

  it("should handle localhost URLs", () => {
    const result = parseURL("http://localhost:3000/api");

    expect(result.isValid).toBe(true);
    expect(result.hostname).toBe("localhost");
    expect(result.port).toBe("3000");
    expect(result.pathname).toBe("/api");
  });

  it("should handle encoded query parameters", () => {
    const result = parseURL("https://example.com?text=hello%20world");

    expect(result.isValid).toBe(true);
    expect(result.searchParams[0]).toEqual({
      key: "text",
      value: "hello world",
    });
  });

  it("should handle duplicate query parameter keys", () => {
    const result = parseURL("https://example.com?tag=a&tag=b&tag=c");

    expect(result.isValid).toBe(true);
    expect(result.searchParams).toHaveLength(3);
    expect(result.searchParams[0]).toEqual({ key: "tag", value: "a" });
    expect(result.searchParams[1]).toEqual({ key: "tag", value: "b" });
    expect(result.searchParams[2]).toEqual({ key: "tag", value: "c" });
  });
});

describe("buildURL", () => {
  it("should build URL from parsed components", () => {
    const parsed = parseURL("https://example.com/path?foo=bar#section");
    const built = buildURL(parsed);

    expect(built).toBe("https://example.com/path?foo=bar#section");
  });

  it("should build URL with modified search params", () => {
    const parsed = parseURL("https://example.com/path");
    parsed.searchParams = [{ key: "new", value: "param" }];
    const built = buildURL(parsed);

    expect(built).toBe("https://example.com/path?new=param");
  });

  it("should return empty string for invalid parsed URL", () => {
    const parsed = parseURL("invalid");
    const built = buildURL(parsed);

    expect(built).toBe("");
  });

  it("should build URL with username and password", () => {
    const parsed = parseURL("https://user:pass@example.com/path");
    const built = buildURL(parsed);

    expect(built).toBe("https://user:pass@example.com/path");
  });

  it("should skip empty search param keys", () => {
    const parsed = parseURL("https://example.com/path");
    parsed.searchParams = [
      { key: "", value: "value" },
      { key: "valid", value: "param" },
    ];
    const built = buildURL(parsed);

    expect(built).toBe("https://example.com/path?valid=param");
  });
});
