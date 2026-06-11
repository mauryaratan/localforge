import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import KeycodePage from "@/app/(tools)/keycode/page";

describe("KeycodePage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("pressing a non-modifier key updates the displayed key info", () => {
    render(<KeycodePage />);

    // Before any key press the placeholder text is shown
    expect(screen.getByText("Press Any Key")).toBeTruthy();

    // Fire a keydown on the document wrapped in act so React flushes state
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "a",
        code: "KeyA",
        keyCode: 65,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
    });

    // After the key press the code "KeyA" should appear in the UI
    // (it appears in both the summary row and the detail card, so use getAllByText)
    expect(screen.getAllByText("KeyA").length).toBeGreaterThan(0);
  });

  it("regression (keyboard trap): Tab keydown is NOT prevented", () => {
    render(<KeycodePage />);

    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      code: "Tab",
      keyCode: 9,
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      document.dispatchEvent(event);
    });

    // The global handler must not call preventDefault for Tab
    expect(event.defaultPrevented).toBe(false);
  });

  it("regression (buttons stay operable): keydown on a button element is NOT prevented", () => {
    render(<KeycodePage />);

    // First press a key so the detail cards render (which contain buttons)
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "a",
          code: "KeyA",
          keyCode: 65,
          bubbles: true,
          cancelable: true,
        })
      );
    });

    // Now the detail section is rendered — grab any of the copy buttons
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    const targetButton = buttons[0];

    const enterEvent = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      targetButton.dispatchEvent(enterEvent);
    });

    // The handler must not preventDefault when the target is inside a button
    expect(enterEvent.defaultPrevented).toBe(false);
  });
});
