import { describe, expect, it } from "vitest";
import {
  schemaExamples,
  validateJsonAgainstSchema,
} from "@/lib/json-schema-validator";

describe("validateJsonAgainstSchema", () => {
  it("validates matching JSON data", () => {
    const result = validateJsonAgainstSchema(
      schemaExamples.data,
      schemaExamples.schema
    );

    expect(result.valid).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("reports validation issues with paths", () => {
    const result = validateJsonAgainstSchema(
      JSON.stringify({ id: 0, email: "nope", extra: true }),
      schemaExamples.schema
    );

    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.keyword)).toEqual(
      expect.arrayContaining(["minimum", "pattern", "required"])
    );
    expect(result.issues.some((issue) => issue.path === "/roles")).toBe(true);
  });

  it("returns a data parse error", () => {
    const result = validateJsonAgainstSchema("{", schemaExamples.schema);

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Data is not valid JSON");
  });

  it("returns a schema parse error", () => {
    const result = validateJsonAgainstSchema("{}", "{");

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Schema is not valid JSON");
  });

  it("returns a schema compile error", () => {
    const result = validateJsonAgainstSchema(
      "{}",
      JSON.stringify({ type: "not-a-json-schema-type" })
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain("Schema is invalid");
  });
});
