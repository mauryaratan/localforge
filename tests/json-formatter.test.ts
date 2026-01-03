import { describe, expect, it } from "vitest";
import {
  buildJsonTree,
  formatJson,
  getAllPaths,
  getJsonStats,
  minifyJson,
  queryJsonPath,
  sortJsonKeys,
  validateJson,
} from "@/lib/json-formatter";

describe("validateJson", () => {
  it("should validate correct JSON", () => {
    const result = validateJson('{"name": "John", "age": 30}');
    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ name: "John", age: 30 });
  });

  it("should validate JSON arrays", () => {
    const result = validateJson("[1, 2, 3]");
    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual([1, 2, 3]);
  });

  it("should return error for empty input", () => {
    const result = validateJson("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter JSON");
  });

  it("should return error for whitespace only", () => {
    const result = validateJson("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter JSON");
  });

  it("should return error for invalid JSON", () => {
    const result = validateJson('{name: "John"}');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error for missing closing brace", () => {
    const result = validateJson('{"name": "John"');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle nested objects", () => {
    const result = validateJson('{"user": {"profile": {"name": "John"}}}');
    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ user: { profile: { name: "John" } } });
  });

  it("should handle special characters in strings", () => {
    const result = validateJson('{"text": "Hello\\nWorld"}');
    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ text: "Hello\nWorld" });
  });
});

describe("formatJson", () => {
  it("should format minified JSON with default indent", () => {
    const result = formatJson('{"name":"John","age":30}');
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n  "name": "John",\n  "age": 30\n}');
  });

  it("should format with custom indent of 4 spaces", () => {
    const result = formatJson('{"name":"John"}', 4);
    expect(result.success).toBe(true);
    expect(result.output).toBe('{\n    "name": "John"\n}');
  });

  it("should return error for invalid JSON", () => {
    const result = formatJson("{invalid}");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle arrays", () => {
    const result = formatJson("[1,2,3]");
    expect(result.success).toBe(true);
    expect(result.output).toBe("[\n  1,\n  2,\n  3\n]");
  });
});

describe("minifyJson", () => {
  it("should minify formatted JSON", () => {
    const input = `{
  "name": "John",
  "age": 30
}`;
    const result = minifyJson(input);
    expect(result.success).toBe(true);
    expect(result.output).toBe('{"name":"John","age":30}');
  });

  it("should return error for invalid JSON", () => {
    const result = minifyJson("{invalid}");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("sortJsonKeys", () => {
  it("should sort object keys alphabetically", () => {
    const result = sortJsonKeys('{"zebra": 1, "apple": 2, "mango": 3}');
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(Object.keys(parsed)).toEqual(["apple", "mango", "zebra"]);
  });

  it("should sort nested object keys", () => {
    const result = sortJsonKeys('{"b": {"z": 1, "a": 2}, "a": 1}');
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(Object.keys(parsed)).toEqual(["a", "b"]);
    expect(Object.keys(parsed.b)).toEqual(["a", "z"]);
  });

  it("should handle arrays without changing order", () => {
    const result = sortJsonKeys('{"items": [3, 1, 2]}');
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.items).toEqual([3, 1, 2]);
  });
});

describe("queryJsonPath", () => {
  const testJson = JSON.stringify({
    user: {
      name: "John",
      profile: {
        email: "john@example.com",
        age: 30,
      },
    },
    products: [
      { id: 1, name: "Laptop", price: 999 },
      { id: 2, name: "Mouse", price: 29 },
      { id: 3, name: "Keyboard", price: 79 },
    ],
  });

  it("should return root for $ path", () => {
    const result = queryJsonPath(testJson, "$");
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });

  it("should get nested property with dot notation", () => {
    const result = queryJsonPath(testJson, "$.user.name");
    expect(result.success).toBe(true);
    expect(result.result).toBe("John");
  });

  it("should get deeply nested property", () => {
    const result = queryJsonPath(testJson, "$.user.profile.email");
    expect(result.success).toBe(true);
    expect(result.result).toBe("john@example.com");
  });

  it("should get array element by index", () => {
    const result = queryJsonPath(testJson, "$.products[0]");
    expect(result.success).toBe(true);
    expect(result.result).toEqual({ id: 1, name: "Laptop", price: 999 });
  });

  it("should get property from array element", () => {
    const result = queryJsonPath(testJson, "$.products[1].name");
    expect(result.success).toBe(true);
    expect(result.result).toBe("Mouse");
  });

  it("should get all array elements with wildcard", () => {
    const result = queryJsonPath(testJson, "$.products[*]");
    expect(result.success).toBe(true);
    expect(Array.isArray(result.result)).toBe(true);
    expect((result.result as unknown[]).length).toBe(3);
  });

  it("should perform recursive descent search", () => {
    const result = queryJsonPath(testJson, "$..name");
    expect(result.success).toBe(true);
    const results = result.result as unknown[];
    expect(results).toContain("John");
    expect(results).toContain("Laptop");
    expect(results).toContain("Mouse");
    expect(results).toContain("Keyboard");
  });

  it("should filter array elements with comparison", () => {
    const result = queryJsonPath(testJson, "$.products[?(@.price<100)]");
    expect(result.success).toBe(true);
    const filtered = result.result as {
      id: number;
      name: string;
      price: number;
    }[];
    expect(filtered.length).toBe(2);
    expect(filtered.every((p) => p.price < 100)).toBe(true);
  });

  it("should filter array elements with equality", () => {
    const result = queryJsonPath(testJson, '$.products[?(@.name=="Laptop")]');
    expect(result.success).toBe(true);
    const filtered = result.result as {
      id: number;
      name: string;
      price: number;
    }[];
    expect(filtered.length).toBe(1);
    expect(filtered[0].name).toBe("Laptop");
  });

  it("should return undefined for non-existent path", () => {
    const result = queryJsonPath(testJson, "$.nonexistent.path");
    expect(result.success).toBe(true);
    expect(result.result).toBeUndefined();
  });

  it("should return error for invalid JSON input", () => {
    const result = queryJsonPath("{invalid}", "$.test");
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should handle empty path query", () => {
    const result = queryJsonPath(testJson, "");
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });
});

describe("buildJsonTree", () => {
  it("should build tree from simple object", () => {
    const data = { name: "John", age: 30 };
    const tree = buildJsonTree(data);
    expect(tree.length).toBe(2);
    expect(tree[0].key).toBe("name");
    expect(tree[0].value).toBe("John");
    expect(tree[0].type).toBe("string");
    expect(tree[1].key).toBe("age");
    expect(tree[1].type).toBe("number");
  });

  it("should build tree from array", () => {
    const data = [1, 2, 3];
    const tree = buildJsonTree(data);
    expect(tree.length).toBe(3);
    expect(tree[0].key).toBe("[0]");
    expect(tree[0].value).toBe(1);
    expect(tree[0].type).toBe("number");
  });

  it("should build tree with nested objects", () => {
    const data = { user: { name: "John" } };
    const tree = buildJsonTree(data);
    expect(tree.length).toBe(1);
    expect(tree[0].key).toBe("user");
    expect(tree[0].type).toBe("object");
    expect(tree[0].children?.length).toBe(1);
    expect(tree[0].children?.[0].key).toBe("name");
  });

  it("should include correct paths", () => {
    const data = { user: { profile: { name: "John" } } };
    const tree = buildJsonTree(data);
    expect(tree[0].path).toBe("$.user");
    expect(tree[0].children?.[0].path).toBe("$.user.profile");
    expect(tree[0].children?.[0].children?.[0].path).toBe(
      "$.user.profile.name"
    );
  });

  it("should handle null values", () => {
    const data = { value: null };
    const tree = buildJsonTree(data);
    expect(tree[0].type).toBe("null");
    expect(tree[0].value).toBeNull();
  });

  it("should handle boolean values", () => {
    const data = { active: true, disabled: false };
    const tree = buildJsonTree(data);
    expect(tree[0].type).toBe("boolean");
    expect(tree[0].value).toBe(true);
    expect(tree[1].type).toBe("boolean");
    expect(tree[1].value).toBe(false);
  });

  it("should return empty array for null input", () => {
    const tree = buildJsonTree(null);
    expect(tree).toEqual([]);
  });

  it("should return empty array for undefined input", () => {
    const tree = buildJsonTree(undefined);
    expect(tree).toEqual([]);
  });
});

describe("getAllPaths", () => {
  it("should get all paths from simple object", () => {
    const data = { name: "John", age: 30 };
    const paths = getAllPaths(data);
    expect(paths).toContain("$");
    expect(paths).toContain("$.name");
    expect(paths).toContain("$.age");
  });

  it("should get all paths from nested object", () => {
    const data = { user: { profile: { name: "John" } } };
    const paths = getAllPaths(data);
    expect(paths).toContain("$.user");
    expect(paths).toContain("$.user.profile");
    expect(paths).toContain("$.user.profile.name");
  });

  it("should get all paths from array", () => {
    const data = { items: [1, 2, 3] };
    const paths = getAllPaths(data);
    expect(paths).toContain("$.items");
    expect(paths).toContain("$.items[*]");
    expect(paths).toContain("$.items[0]");
    expect(paths).toContain("$.items[1]");
    expect(paths).toContain("$.items[2]");
  });

  it("should handle complex nested structures", () => {
    const data = {
      users: [
        { name: "John", email: "john@example.com" },
        { name: "Jane", email: "jane@example.com" },
      ],
    };
    const paths = getAllPaths(data);
    expect(paths).toContain("$.users");
    expect(paths).toContain("$.users[*]");
    expect(paths).toContain("$.users[0]");
    expect(paths).toContain("$.users[0].name");
    expect(paths).toContain("$.users[0].email");
  });
});

describe("getJsonStats", () => {
  it("should count keys in simple object", () => {
    const data = { a: 1, b: 2, c: 3 };
    const stats = getJsonStats(data);
    expect(stats.keyCount).toBe(3);
    expect(stats.objectCount).toBe(1);
    expect(stats.arrayCount).toBe(0);
  });

  it("should count keys in nested objects", () => {
    const data = { user: { name: "John", profile: { age: 30 } } };
    const stats = getJsonStats(data);
    expect(stats.keyCount).toBe(4); // user, name, profile, age
    expect(stats.objectCount).toBe(3);
  });

  it("should count arrays", () => {
    const data = { items: [1, 2, 3], tags: ["a", "b"] };
    const stats = getJsonStats(data);
    expect(stats.arrayCount).toBe(2);
  });

  it("should calculate max depth", () => {
    const data = { a: { b: { c: { d: 1 } } } };
    const stats = getJsonStats(data);
    expect(stats.maxDepth).toBe(4);
  });

  it("should handle flat structure", () => {
    const data = { a: 1, b: 2 };
    const stats = getJsonStats(data);
    expect(stats.maxDepth).toBe(1);
  });

  it("should handle empty object", () => {
    const data = {};
    const stats = getJsonStats(data);
    expect(stats.keyCount).toBe(0);
    expect(stats.objectCount).toBe(1);
    expect(stats.maxDepth).toBe(0);
  });

  it("should handle array of objects", () => {
    const data = { items: [{ a: 1 }, { b: 2 }] };
    const stats = getJsonStats(data);
    expect(stats.arrayCount).toBe(1);
    expect(stats.objectCount).toBe(3); // root + 2 items
  });
});
