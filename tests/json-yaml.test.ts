import { describe, expect, it } from "vitest";
import {
  formatJson,
  jsonToYaml,
  minifyJson,
  validateJson,
  validateYaml,
  yamlToJson,
} from "@/lib/json-yaml";

describe("validateJson", () => {
  it("should validate a simple JSON object", () => {
    const result = validateJson('{"name": "John"}');

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ name: "John" });
  });

  it("should validate a JSON array", () => {
    const result = validateJson("[1, 2, 3]");

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual([1, 2, 3]);
  });

  it("should validate nested JSON", () => {
    const result = validateJson('{"user": {"name": "John", "age": 30}}');

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ user: { name: "John", age: 30 } });
  });

  it("should return error for empty string", () => {
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
    const result = validateJson("{invalid}");

    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error for trailing comma", () => {
    const result = validateJson('{"name": "John",}');

    expect(result.isValid).toBe(false);
  });

  it("should return error for single quotes", () => {
    const result = validateJson("{'name': 'John'}");

    expect(result.isValid).toBe(false);
  });
});

describe("jsonToYaml", () => {
  it("should convert simple JSON to YAML", () => {
    const result = jsonToYaml('{"name": "John", "age": 30}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("name: John");
    expect(result.output).toContain("age: 30");
  });

  it("should convert nested JSON to YAML", () => {
    const result = jsonToYaml('{"user": {"name": "John"}}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("user:");
    expect(result.output).toContain("name: John");
  });

  it("should convert array to YAML", () => {
    const result = jsonToYaml('{"items": ["a", "b", "c"]}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("items:");
    expect(result.output).toContain("- a");
    expect(result.output).toContain("- b");
    expect(result.output).toContain("- c");
  });

  it("should handle null values", () => {
    const result = jsonToYaml('{"value": null}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("value: null");
  });

  it("should handle boolean values", () => {
    const result = jsonToYaml('{"active": true, "disabled": false}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("active: true");
    expect(result.output).toContain("disabled: false");
  });

  it("should handle numbers", () => {
    const result = jsonToYaml('{"int": 42, "float": 3.14}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("int: 42");
    expect(result.output).toContain("float: 3.14");
  });

  it("should return error for invalid JSON", () => {
    const result = jsonToYaml("{invalid}");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it("should return error for empty input", () => {
    const result = jsonToYaml("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter JSON");
  });

  it("should handle complex nested structures", () => {
    const json = JSON.stringify({
      apiVersion: "v1",
      kind: "ConfigMap",
      metadata: {
        name: "app-config",
        labels: {
          app: "myapp",
        },
      },
      data: {
        key: "value",
      },
    });

    const result = jsonToYaml(json);

    expect(result.success).toBe(true);
    expect(result.output).toContain("apiVersion: v1");
    expect(result.output).toContain("kind: ConfigMap");
    expect(result.output).toContain("metadata:");
    expect(result.output).toContain("name: app-config");
  });

  it("should handle array of objects", () => {
    const result = jsonToYaml('[{"name": "John"}, {"name": "Jane"}]');

    expect(result.success).toBe(true);
    expect(result.output).toContain("- name: John");
    expect(result.output).toContain("- name: Jane");
  });

  it("should handle strings with special characters", () => {
    const result = jsonToYaml(
      '{"url": "https://example.com/path?query=value"}'
    );

    expect(result.success).toBe(true);
    expect(result.output).toContain("url:");
  });
});

describe("formatJson", () => {
  it("should format minified JSON", () => {
    const result = formatJson('{"name":"John","age":30}');

    expect(result.success).toBe(true);
    expect(result.output).toContain("  ");
    expect(result.output).toContain('"name": "John"');
  });

  it("should handle already formatted JSON", () => {
    const input = `{
  "name": "John"
}`;
    const result = formatJson(input);

    expect(result.success).toBe(true);
    expect(result.output).toContain('"name": "John"');
  });

  it("should return error for invalid JSON", () => {
    const result = formatJson("{invalid}");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
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

  it("should handle already minified JSON", () => {
    const result = minifyJson('{"name":"John"}');

    expect(result.success).toBe(true);
    expect(result.output).toBe('{"name":"John"}');
  });

  it("should return error for invalid JSON", () => {
    const result = minifyJson("{invalid}");

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe("validateYaml", () => {
  it("should validate simple YAML", () => {
    const result = validateYaml("name: John");

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ name: "John" });
  });

  it("should validate nested YAML", () => {
    const yaml = `user:
  name: John
  age: 30`;
    const result = validateYaml(yaml);

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ user: { name: "John", age: 30 } });
  });

  it("should validate YAML with arrays", () => {
    const yaml = `items:
  - apple
  - banana`;
    const result = validateYaml(yaml);

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ items: ["apple", "banana"] });
  });

  it("should return error for empty string", () => {
    const result = validateYaml("");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter YAML");
  });

  it("should return error for whitespace only", () => {
    const result = validateYaml("   ");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter YAML");
  });

  it("should handle boolean values", () => {
    const yaml = `active: true
disabled: false`;
    const result = validateYaml(yaml);

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ active: true, disabled: false });
  });

  it("should handle null values", () => {
    const result = validateYaml("value: null");

    expect(result.isValid).toBe(true);
    expect(result.parsed).toEqual({ value: null });
  });
});

describe("yamlToJson", () => {
  it("should convert simple YAML to JSON", () => {
    const yaml = `name: John
age: 30`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({ name: "John", age: 30 });
  });

  it("should convert nested YAML to JSON", () => {
    const yaml = `user:
  name: John
  profile:
    email: john@example.com`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({
      user: {
        name: "John",
        profile: { email: "john@example.com" },
      },
    });
  });

  it("should convert YAML arrays to JSON", () => {
    const yaml = `fruits:
  - apple
  - banana
  - orange`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual({ fruits: ["apple", "banana", "orange"] });
  });

  it("should handle Kubernetes-style config", () => {
    const yaml = `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  labels:
    app: myapp`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.apiVersion).toBe("v1");
    expect(parsed.kind).toBe("ConfigMap");
    expect(parsed.metadata.name).toBe("app-config");
    expect(parsed.metadata.labels.app).toBe("myapp");
  });

  it("should return error for empty input", () => {
    const result = yamlToJson("");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Please enter YAML");
  });

  it("should return pretty JSON by default", () => {
    const result = yamlToJson("name: John");

    expect(result.success).toBe(true);
    expect(result.output).toContain("\n");
    expect(result.output).toContain("  ");
  });

  it("should return minified JSON when pretty is false", () => {
    const result = yamlToJson("name: John", false);

    expect(result.success).toBe(true);
    expect(result.output).toBe('{"name":"John"}');
  });

  it("should handle numbers", () => {
    const yaml = `int: 42
float: 3.14`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.int).toBe(42);
    expect(parsed.float).toBe(3.14);
  });

  it("should handle multi-line strings", () => {
    const yaml = `description: |
  This is a
  multi-line string`;
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.description).toContain("This is a");
    expect(parsed.description).toContain("multi-line string");
  });

  it("should handle inline arrays", () => {
    const yaml = "items: [1, 2, 3]";
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.items).toEqual([1, 2, 3]);
  });

  it("should handle inline objects", () => {
    const yaml = "person: {name: John, age: 30}";
    const result = yamlToJson(yaml);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.person).toEqual({ name: "John", age: 30 });
  });
});
