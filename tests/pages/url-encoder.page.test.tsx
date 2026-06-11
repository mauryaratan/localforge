import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import UrlEncoderPage from "@/app/(tools)/url-encoder/page";

describe("UrlEncoderPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without crashing and shows the page heading", () => {
    render(<UrlEncoderPage />);
    expect(screen.getByText("URL Encoder / Decoder")).toBeTruthy();
  });

  it("typing plain text into the decoded textarea produces URL-encoded output", () => {
    render(<UrlEncoderPage />);

    const decodedInput = screen.getByRole("textbox", {
      name: "Decoded text input",
    });
    fireEvent.change(decodedInput, { target: { value: "hello world" } });

    const encodedInput = screen.getByRole("textbox", {
      name: "Encoded text input",
    });
    expect((encodedInput as HTMLTextAreaElement).value).toBe("hello%20world");
  });

  it("typing a malformed percent-sequence into the encoded textarea shows the error", () => {
    render(<UrlEncoderPage />);

    const encodedInput = screen.getByRole("textbox", {
      name: "Encoded text input",
    });
    fireEvent.change(encodedInput, { target: { value: "%E0%" } });

    expect(screen.getByText("Invalid URL encoding")).toBeTruthy();
  });
});
