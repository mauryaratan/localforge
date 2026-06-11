/**
 * URL state utilities for shareable tool links.
 *
 * Design constraints (Plan 009):
 * 1. Encoding: JSON → UTF-8 → base64url (no compression dependency).
 * 2. Size guard: encoded value > 1,500 chars → return null from buildShareUrl.
 * 3. Read-on-load: URL state wins over localStorage; applied once on mount;
 *    param stripped via history.replaceState after read.
 * 4. Explicit share only: URL built on button click, never per-keystroke.
 * 5. Malformed input: ignored silently, falls back to localStorage.
 */

const SIZE_LIMIT = 1500;

/**
 * Encode a value to a base64url string (JSON → UTF-8 → base64url).
 * Returns null if encoding fails.
 */
function encodeState(value: unknown): string | null {
  try {
    const json = JSON.stringify(value);
    const bytes = new TextEncoder().encode(json);
    const binary = String.fromCharCode(...bytes);
    const b64 = btoa(binary);
    // base64url: replace + → -, / → _, strip =
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } catch {
    return null;
  }
}

/**
 * Decode a base64url string back to a typed value.
 * Returns null on any decoding/parsing failure.
 */
function decodeState<T>(encoded: string): T | null {
  try {
    // base64url → standard base64
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    // Add back padding
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Read URL state from the `?state=` query parameter.
 *
 * - Parses `window.location.search` for `state`.
 * - Decodes per the base64url scheme in constraint 1.
 * - On successful read, strips the param via `history.replaceState`.
 * - Returns null on any failure (malformed, SSR, missing param).
 * - SSR-safe: guards `typeof window`.
 */
export function readUrlState<T>(): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("state");
    if (!encoded) {
      return null;
    }

    const value = decodeState<T>(encoded);

    // Strip the param regardless of parse success so it doesn't linger
    params.delete("state");
    const newSearch = params.toString();
    const newUrl =
      window.location.pathname +
      (newSearch ? `?${newSearch}` : "") +
      window.location.hash;
    history.replaceState(null, "", newUrl);

    return value;
  } catch {
    return null;
  }
}

/**
 * Build a shareable URL containing the current state as a `?state=` param.
 *
 * - Encodes `state` per constraint 1.
 * - Returns null when the encoded URL would exceed SIZE_LIMIT chars
 *   (caller should toast "Content too large to share as a link").
 * - SSR-safe: guards `typeof window`.
 */
export function buildShareUrl(state: unknown): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const encoded = encodeState(state);
  if (encoded === null) {
    return null;
  }

  const base =
    window.location.origin +
    window.location.pathname +
    (window.location.hash ?? "");
  const url = `${base}?state=${encoded}`;

  if (url.length > SIZE_LIMIT) {
    return null;
  }

  return url;
}
