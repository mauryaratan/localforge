import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Helper: encode state to ?state= the same way the hook does
function encodeStateForTest(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  const binary = String.fromCharCode(...bytes);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

describe("Base64Page — URL state hydration", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(history, "replaceState").mockImplementation(vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    // Restore original location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  it("applies URL state to inputs on mount and strips ?state= from the address bar", async () => {
    const payload = {
      plainText: "hello from url",
      encodedText: "aGVsbG8gZnJvbSB1cmw=",
      mode: "standard",
      lastEdited: "plain",
    };
    const encoded = encodeStateForTest(payload);

    // Set window.location to include ?state= before rendering
    window.history.replaceState(null, "", `/?state=${encoded}`);
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/?state=${encoded}`),
      configurable: true,
      writable: true,
    });

    // Dynamically import after setting location so readUrlState sees it
    const { default: Base64Page } = await import("@/app/(tools)/base64/page");
    render(<Base64Page />);

    // State should be applied: plain-text textarea should contain the URL payload value
    const plainInput = screen.getByRole("textbox", {
      name: "Plain text input",
    });
    expect((plainInput as HTMLTextAreaElement).value).toBe("hello from url");

    // history.replaceState should have been called to strip ?state=
    // The last call's 3rd argument (newUrl) must not contain "state="
    expect(history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      expect.not.stringContaining("state=")
    );
  });
});
