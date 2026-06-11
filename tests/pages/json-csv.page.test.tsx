import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import JsonCsvPage from "@/app/(tools)/json-csv/page";

describe("JsonCsvPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("auto-detects semicolon delimiter for semicolon-delimited CSV and produces JSON output", () => {
    render(<JsonCsvPage />);

    // Switch to CSV → JSON mode first
    const csvToJsonButton = screen.getByText("CSV → JSON");
    fireEvent.click(csvToJsonButton);

    const input = screen.getByRole("textbox", { name: "CSV input" });
    fireEvent.change(input, { target: { value: "a;b\n1;2" } });

    const output = screen.getByRole("textbox", { name: "JSON output" });
    const value = (output as HTMLTextAreaElement).value;
    expect(value).not.toBe("");

    // Parsed JSON must contain keys "a" and "b"
    const parsed = JSON.parse(value);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toHaveProperty("a");
    expect(parsed[0]).toHaveProperty("b");
  });

  it("regression: manually chosen delimiter is not overwritten by auto-detect on subsequent input", () => {
    render(<JsonCsvPage />);

    // Switch to CSV → JSON mode
    const csvToJsonButton = screen.getByText("CSV → JSON");
    fireEvent.click(csvToJsonButton);

    // Type comma CSV so auto-detect runs and sets delimiter to ","
    const input = screen.getByRole("textbox", { name: "CSV input" });
    fireEvent.change(input, { target: { value: "a,b\n1,2" } });

    const output = screen.getByRole("textbox", { name: "JSON output" });
    let parsed = JSON.parse((output as HTMLTextAreaElement).value);
    expect(parsed[0]).toHaveProperty("a");
    expect(parsed[0]).toHaveProperty("b");

    // Manually select the Semicolon delimiter via the Select UI. The Base UI
    // popup renders into a portal on document.body, which screen queries cover.
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    const semicolonOption = screen.getByRole("option", {
      name: "Semicolon (;)",
    });
    // Base UI commits the selection on a full pointer press sequence,
    // so a bare click is not enough in jsdom.
    fireEvent.pointerDown(semicolonOption);
    fireEvent.mouseDown(semicolonOption);
    fireEvent.pointerUp(semicolonOption);
    fireEvent.mouseUp(semicolonOption);
    fireEvent.click(semicolonOption);

    // Intermediate state: the text is still comma CSV, so parsing it with the
    // manually chosen semicolon delimiter yields a single column — proving
    // the manual choice actually took effect (pre-fix code would auto-detect
    // comma again and keep two columns).
    parsed = JSON.parse((output as HTMLTextAreaElement).value);
    expect(Object.keys(parsed[0])).toHaveLength(1);

    // Now type semicolon CSV — the manual semicolon choice is honored.
    fireEvent.change(input, { target: { value: "x;y\n3;4" } });

    parsed = JSON.parse((output as HTMLTextAreaElement).value);
    expect(parsed[0]).toHaveProperty("x");
    expect(parsed[0]).toHaveProperty("y");
  });

  it("regression: invalid CSV + mode toggle preserves the input text", () => {
    render(<JsonCsvPage />);

    // Switch to CSV → JSON mode
    const csvToJsonButton = screen.getByText("CSV → JSON");
    fireEvent.click(csvToJsonButton);

    const badCsv = "just-a-header-no-rows";
    const input = screen.getByRole("textbox", { name: "CSV input" });
    fireEvent.change(input, { target: { value: badCsv } });

    // Conversion should fail (header-only CSV) → output empty
    const output = screen.getByRole("textbox", { name: "JSON output" });
    expect((output as HTMLTextAreaElement).value).toBe("");

    // Toggle back to JSON → CSV mode
    const jsonToCsvButton = screen.getByText("JSON → CSV");
    fireEvent.click(jsonToCsvButton);

    // The fixed guard must keep the user's text because output was empty
    const newInput = screen.getByRole("textbox", { name: "JSON input" });
    expect((newInput as HTMLTextAreaElement).value).toBe(badCsv);
  });
});
