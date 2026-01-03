/**
 * Base64 encoding/decoding utilities
 * Supports standard Base64 and URL-safe Base64 (Base64URL)
 */

export type Base64Mode = "standard" | "url-safe";

export type Base64Result = {
  success: boolean;
  data: string;
  error?: string;
};

/**
 * Encode a string to Base64
 * @param input - The string to encode
 * @param mode - "standard" for regular Base64, "url-safe" for Base64URL
 * @returns Encoded Base64 string
 */
export const encodeBase64 = (
  input: string,
  mode: Base64Mode = "standard"
): Base64Result => {
  if (!input) {
    return { success: true, data: "" };
  }

  try {
    // Convert string to UTF-8 bytes, then to Base64
    const utf8Bytes = new TextEncoder().encode(input);
    const binaryString = Array.from(utf8Bytes, (byte) =>
      String.fromCharCode(byte)
    ).join("");
    let encoded = btoa(binaryString);

    if (mode === "url-safe") {
      // Convert to URL-safe Base64 (RFC 4648)
      // Replace + with -, / with _, and remove padding =
      encoded = encoded
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }

    return { success: true, data: encoded };
  } catch (error) {
    return {
      success: false,
      data: "",
      error: error instanceof Error ? error.message : "Failed to encode",
    };
  }
};

/**
 * Decode a Base64 string
 * @param input - The Base64 string to decode
 * @param mode - "standard" for regular Base64, "url-safe" for Base64URL
 * @returns Decoded string
 */
export const decodeBase64 = (
  input: string,
  mode: Base64Mode = "standard"
): Base64Result => {
  if (!input) {
    return { success: true, data: "" };
  }

  try {
    let base64 = input;

    if (mode === "url-safe") {
      // Convert from URL-safe Base64 back to standard
      base64 = input.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      const padding = base64.length % 4;
      if (padding) {
        base64 += "=".repeat(4 - padding);
      }
    }

    // Decode Base64 to binary string, then to UTF-8
    const binaryString = atob(base64);
    const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
    const decoded = new TextDecoder("utf-8").decode(bytes);

    return { success: true, data: decoded };
  } catch (error) {
    return {
      success: false,
      data: "",
      error: "Invalid Base64 string",
    };
  }
};

/**
 * Check if a string is valid Base64
 * @param input - The string to check
 * @param mode - "standard" or "url-safe"
 * @returns boolean indicating validity
 */
export const isValidBase64 = (
  input: string,
  mode: Base64Mode = "standard"
): boolean => {
  if (!input) return true;

  const standardPattern = /^[A-Za-z0-9+/]*={0,2}$/;
  const urlSafePattern = /^[A-Za-z0-9_-]*$/;

  const pattern = mode === "url-safe" ? urlSafePattern : standardPattern;

  if (!pattern.test(input)) return false;

  // Also verify it can be decoded
  const result = decodeBase64(input, mode);
  return result.success;
};

/**
 * Calculate the size difference between original and encoded strings
 * @param original - Original string
 * @param encoded - Base64 encoded string
 * @returns Object with sizes and ratio
 */
export const calculateSizeInfo = (original: string, encoded: string) => {
  const originalBytes = new TextEncoder().encode(original).length;
  const encodedBytes = encoded.length;
  const ratio =
    originalBytes > 0 ? ((encodedBytes / originalBytes) * 100).toFixed(1) : "0";

  return {
    originalBytes,
    encodedBytes,
    ratio: `${ratio}%`,
    increase: encodedBytes - originalBytes,
  };
};
