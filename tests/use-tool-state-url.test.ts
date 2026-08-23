import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Helper: encode a value to ?state= the same way the hook does, for test setup
function encodeStateForTest(value: unknown): string {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  const binary = String.fromCharCode(...bytes);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

describe("use-tool-state-url", () => {
  // Save and restore real window.location between tests
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetModules();
    // Reset location to a clean state
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64"),
      configurable: true,
      writable: true,
    });
    // Spy on history.replaceState so tests can assert it was called
    vi.spyOn(history, "replaceState").mockImplementation(vi.fn());
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  // ── readUrlState ─────────────────────────────────────────────────────────

  it("round-trips a plain object through URL → decoded value", async () => {
    const payload = { plainText: "hello", mode: "standard" };
    const encoded = encodeStateForTest(payload);
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/base64?state=${encoded}`),
      configurable: true,
      writable: true,
    });

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    const result = readUrlState<typeof payload>();

    expect(result).toEqual(payload);
  });

  it("unicode and emoji survive the round-trip (✓ 🌍)", async () => {
    const payload = { text: "Héllo Wörld 你好 🌍 ✓" };
    const encoded = encodeStateForTest(payload);
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/base64?state=${encoded}`),
      configurable: true,
      writable: true,
    });

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    const result = readUrlState<typeof payload>();

    expect(result).toEqual(payload);
  });

  it("returns null for malformed ?state= (not valid base64)", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64?state=!!!notvalid!!!"),
      configurable: true,
      writable: true,
    });

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    const result = readUrlState();

    expect(result).toBeNull();
  });

  it("returns null for valid base64 that is not valid JSON", async () => {
    // "not json" in base64url
    const notJson = btoa("not-valid-json")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/base64?state=${notJson}`),
      configurable: true,
      writable: true,
    });

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    const result = readUrlState();

    expect(result).toBeNull();
  });

  it("returns null when there is no ?state= param", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64"),
      configurable: true,
      writable: true,
    });

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    const result = readUrlState();

    expect(result).toBeNull();
  });

  it("strips ?state= from location.search after a successful read", async () => {
    const payload = { text: "test" };
    const encoded = encodeStateForTest(payload);
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/base64?state=${encoded}`),
      configurable: true,
      writable: true,
    });

    const replaceStateSpy = vi
      .spyOn(history, "replaceState")
      .mockImplementation(vi.fn());

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    readUrlState();

    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/base64");
  });

  it("strips ?state= but keeps other query params", async () => {
    const payload = { text: "test" };
    const encoded = encodeStateForTest(payload);
    Object.defineProperty(window, "location", {
      value: new URL(`http://localhost/base64?foo=bar&state=${encoded}`),
      configurable: true,
      writable: true,
    });

    const replaceStateSpy = vi
      .spyOn(history, "replaceState")
      .mockImplementation(vi.fn());

    const { readUrlState } = await import("@/hooks/use-tool-state-url");
    readUrlState();

    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "/base64?foo=bar");
  });

  // ── buildShareUrl ─────────────────────────────────────────────────────────

  it("builds a URL that can be decoded back to the original value", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64"),
      configurable: true,
      writable: true,
    });

    const payload = { plainText: "hello world", mode: "url-safe" };
    const { buildShareUrl, readUrlState } = await import(
      "@/hooks/use-tool-state-url"
    );

    const shareUrl = buildShareUrl(payload);
    expect(shareUrl).not.toBeNull();

    // Parse the ?state= param from the built URL and decode it
    const url = new URL(shareUrl as string);
    const encoded = url.searchParams.get("state");
    expect(encoded).not.toBeNull();

    // Point window.location at the share URL and read it back
    Object.defineProperty(window, "location", {
      value: url,
      configurable: true,
      writable: true,
    });
    vi.spyOn(history, "replaceState").mockImplementation(vi.fn());

    const result = readUrlState<typeof payload>();
    expect(result).toEqual(payload);
  });

  it("returns null from buildShareUrl when state exceeds 1,500 char limit", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64"),
      configurable: true,
      writable: true,
    });

    const { buildShareUrl } = await import("@/hooks/use-tool-state-url");
    // ~1200 bytes of content → encoded URL will exceed 1500 chars
    const largeState = { text: "x".repeat(1200) };
    const result = buildShareUrl(largeState);

    expect(result).toBeNull();
  });

  it("returns a URL (not null) for content just within the size limit", async () => {
    Object.defineProperty(window, "location", {
      value: new URL("http://localhost/base64"),
      configurable: true,
      writable: true,
    });

    const { buildShareUrl } = await import("@/hooks/use-tool-state-url");
    // Small content — well within 1500 chars
    const smallState = { text: "hello" };
    const result = buildShareUrl(smallState);

    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
    expect((result as string).length).toBeLessThanOrEqual(1500);
  });
});
