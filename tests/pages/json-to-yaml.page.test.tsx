import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import JsonYamlPage from "@/app/(tools)/json-to-yaml/page";

describe("JsonYamlPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("valid JSON typed into input produces YAML output", () => {
    render(<JsonYamlPage />);

    const input = screen.getByRole("textbox", { name: "JSON input" });
    fireEvent.change(input, {
      target: { value: '{"name": "Alice", "age": 30}' },
    });

    // The output textarea has aria-label "YAML output"
    const output = screen.getByRole("textbox", { name: "YAML output" });
    const value = (output as HTMLTextAreaElement).value;
    expect(value).toContain("name: Alice");
    expect(value).toContain("age: 30");
  });

  it("regression: invalid JSON + mode toggle keeps the input text intact", () => {
    render(<JsonYamlPage />);

    const invalidJson = "{oops";

    const input = screen.getByRole("textbox", { name: "JSON input" });
    fireEvent.change(input, { target: { value: invalidJson } });

    // Conversion fails → output should be empty
    const output = screen.getByRole("textbox", { name: "YAML output" });
    expect((output as HTMLTextAreaElement).value).toBe("");

    // Toggle to YAML → JSON mode
    const yamlToJsonButton = screen.getByText("YAML → JSON");
    fireEvent.click(yamlToJsonButton);

    // After the toggle the input pane is now "YAML input".
    // The fixed guard should preserve the user's text because output was empty.
    const newInput = screen.getByRole("textbox", { name: "YAML input" });
    expect((newInput as HTMLTextAreaElement).value).toBe(invalidJson);
  });

  it("with valid input, toggling mode swaps output into the input pane", () => {
    render(<JsonYamlPage />);

    const input = screen.getByRole("textbox", { name: "JSON input" });
    fireEvent.change(input, { target: { value: '{"key": "value"}' } });

    const output = screen.getByRole("textbox", { name: "YAML output" });
    const yamlValue = (output as HTMLTextAreaElement).value;
    expect(yamlValue.trim()).not.toBe("");

    // Toggle to YAML → JSON mode
    const yamlToJsonButton = screen.getByText("YAML → JSON");
    fireEvent.click(yamlToJsonButton);

    const newInput = screen.getByRole("textbox", { name: "YAML input" });
    expect((newInput as HTMLTextAreaElement).value).toBe(yamlValue);
  });
});
