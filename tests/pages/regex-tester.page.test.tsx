import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import RegexTesterPage from "@/app/(tools)/regex-tester/page";

// jsdom has no Worker — the page exercises the synchronous fallback path.
//
// The regex effect debounces 150ms before calling testRegex. We use
// `screen.findBy*` with a generous timeout so real timers elapse naturally.
//
// base-ui's ScrollArea calls `element.getAnimations()` in a setTimeout that
// fires after render. Shim it so jsdom does not throw unhandled exceptions.
if (typeof Element !== "undefined" && !Element.prototype.getAnimations) {
  Element.prototype.getAnimations = () => [];
}

// Regex placed at module level per linter requirement
const INVALID_REGEX_TEXT = /invalid/i;

describe("RegexTesterPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing and shows the page heading", () => {
    render(<RegexTesterPage />);
    expect(screen.getByText("Regex Tester")).toBeTruthy();
  });

  it("typing a valid pattern and test string shows match count", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", { name: "Regex pattern" });
    const testInput = screen.getByRole("textbox", { name: "Test string" });

    fireEvent.change(patternInput, { target: { value: "\\d+" } });
    fireEvent.change(testInput, { target: { value: "abc 123" } });

    // Wait for the 150ms debounce to fire and state to update
    const matchBadge = await screen.findByText(
      "1 match",
      {},
      { timeout: 1000 }
    );
    expect(matchBadge).toBeTruthy();

    // The rendered match output must show the matched text, not just the count
    const matchedText = await screen.findAllByText(
      "123",
      {},
      { timeout: 1000 }
    );
    expect(matchedText.length).toBeGreaterThan(0);
  });

  it("an invalid pattern surfaces the error badge", async () => {
    render(<RegexTesterPage />);

    const patternInput = screen.getByRole("textbox", { name: "Regex pattern" });
    fireEvent.change(patternInput, { target: { value: "[" } });

    // The error text from createRegex is shown in a destructive Badge
    const errorBadge = await screen.findByText(
      INVALID_REGEX_TEXT,
      {},
      { timeout: 1000 }
    );
    expect(errorBadge).toBeTruthy();
  });
});
