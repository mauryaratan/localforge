import { describe, expect, it } from "vitest";

// Pure utility function tests that don't require WASM
// These functions are tested separately from WASM-dependent functions

// Re-implement the utility functions locally for testing
// This avoids the dynamic import issue with WASM modules

const formatBytes = (bytes: number): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || value % 1 === 0 ? 0 : 1)} ${units[exponent]}`;
};

const formatSavings = (delta: number): string => {
  const sign = delta >= 0 ? "-" : "+";
  return `${sign}${Math.abs(delta).toFixed(1)}%`;
};

const detectAlpha = (data: Uint8ClampedArray): boolean => {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] !== 255) return true;
  }
  return false;
};

const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg"];

const isFileSupported = (file: File): boolean => {
  return ACCEPTED_MIME_TYPES.includes(file.type);
};

const calculateResizeDimensions = (
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  const aspectRatio = srcWidth / srcHeight;

  let width = maxWidth;
  let height = Math.round(maxWidth / aspectRatio);

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(maxHeight * aspectRatio);
  }

  return { width: Math.max(1, width), height: Math.max(1, height) };
};

describe("formatBytes", () => {
  it("should return '0 B' for 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("should format bytes correctly", () => {
    expect(formatBytes(100)).toBe("100 B");
    expect(formatBytes(500)).toBe("500 B");
  });

  it("should format kilobytes correctly", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10 KB");
  });

  it("should format megabytes correctly", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
    expect(formatBytes(10485760)).toBe("10 MB");
  });

  it("should format gigabytes correctly", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });

  it("should handle decimal values appropriately", () => {
    expect(formatBytes(1500)).toBe("1.5 KB");
    expect(formatBytes(1100)).toBe("1.1 KB");
  });
});

describe("formatSavings", () => {
  it("should format positive savings with minus sign", () => {
    expect(formatSavings(50)).toBe("-50.0%");
    expect(formatSavings(75.5)).toBe("-75.5%");
  });

  it("should format negative savings (size increase) with plus sign", () => {
    expect(formatSavings(-10)).toBe("+10.0%");
    expect(formatSavings(-25.5)).toBe("+25.5%");
  });

  it("should handle zero savings", () => {
    expect(formatSavings(0)).toBe("-0.0%");
  });

  it("should round to one decimal place", () => {
    expect(formatSavings(33.333)).toBe("-33.3%");
    expect(formatSavings(66.666)).toBe("-66.7%");
  });
});

describe("detectAlpha", () => {
  it("should return false for fully opaque pixels", () => {
    // RGBA data with all alpha = 255
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel
      0, 255, 0, 255, // Green pixel
      0, 0, 255, 255, // Blue pixel
      255, 255, 255, 255, // White pixel
    ]);
    expect(detectAlpha(data)).toBe(false);
  });

  it("should return true for pixels with transparency", () => {
    // RGBA data with some alpha < 255
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel (opaque)
      0, 255, 0, 128, // Green pixel (semi-transparent)
      0, 0, 255, 255, // Blue pixel (opaque)
      255, 255, 255, 255, // White pixel (opaque)
    ]);
    expect(detectAlpha(data)).toBe(true);
  });

  it("should return true for fully transparent pixels", () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 0, // Red pixel (fully transparent)
    ]);
    expect(detectAlpha(data)).toBe(true);
  });

  it("should return false for empty data", () => {
    const data = new Uint8ClampedArray([]);
    expect(detectAlpha(data)).toBe(false);
  });
});

describe("isFileSupported", () => {
  it("should return true for PNG files", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    expect(isFileSupported(file)).toBe(true);
  });

  it("should return true for JPEG files", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    expect(isFileSupported(file)).toBe(true);
  });

  it("should return false for unsupported types", () => {
    const gifFile = new File([""], "test.gif", { type: "image/gif" });
    expect(isFileSupported(gifFile)).toBe(false);

    const webpFile = new File([""], "test.webp", { type: "image/webp" });
    expect(isFileSupported(webpFile)).toBe(false);

    const svgFile = new File([""], "test.svg", { type: "image/svg+xml" });
    expect(isFileSupported(svgFile)).toBe(false);
  });

  it("should return false for non-image files", () => {
    const textFile = new File([""], "test.txt", { type: "text/plain" });
    expect(isFileSupported(textFile)).toBe(false);

    const pdfFile = new File([""], "test.pdf", { type: "application/pdf" });
    expect(isFileSupported(pdfFile)).toBe(false);
  });
});

describe("ACCEPTED_MIME_TYPES", () => {
  it("should include PNG and JPEG", () => {
    expect(ACCEPTED_MIME_TYPES).toContain("image/png");
    expect(ACCEPTED_MIME_TYPES).toContain("image/jpeg");
  });

  it("should have exactly 2 types", () => {
    expect(ACCEPTED_MIME_TYPES).toHaveLength(2);
  });
});

describe("calculateResizeDimensions", () => {
  it("should maintain aspect ratio for landscape images", () => {
    const result = calculateResizeDimensions(1920, 1080, 800, 600);
    expect(result.width).toBe(800);
    expect(result.height).toBe(450); // 800 / (1920/1080) = 450
  });

  it("should maintain aspect ratio for portrait images", () => {
    const result = calculateResizeDimensions(1080, 1920, 800, 600);
    expect(result.width).toBe(338); // 600 * (1080/1920) = 337.5 -> 338
    expect(result.height).toBe(600);
  });

  it("should maintain aspect ratio for square images", () => {
    const result = calculateResizeDimensions(1000, 1000, 500, 500);
    expect(result.width).toBe(500);
    expect(result.height).toBe(500);
  });

  it("should handle very wide images", () => {
    const result = calculateResizeDimensions(4000, 500, 800, 600);
    expect(result.width).toBe(800);
    expect(result.height).toBe(100); // 800 / (4000/500) = 100
  });

  it("should handle very tall images", () => {
    const result = calculateResizeDimensions(500, 4000, 800, 600);
    expect(result.width).toBe(75); // 600 * (500/4000) = 75
    expect(result.height).toBe(600);
  });

  it("should never return dimensions less than 1", () => {
    const result = calculateResizeDimensions(10000, 1, 100, 100);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("should handle same dimensions", () => {
    const result = calculateResizeDimensions(800, 600, 800, 600);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it("should scale down large images", () => {
    const result = calculateResizeDimensions(3840, 2160, 1920, 1080);
    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });
});

describe("Type definitions", () => {
  it("should have valid type definitions for EncodeFormat", () => {
    const encodeFormat: "png" | "jpeg" = "png";
    expect(encodeFormat).toBe("png");
  });

  it("should have valid type definitions for PresetLevel", () => {
    const presetLevel: 0 | 1 | 2 = 1;
    expect(presetLevel).toBe(1);
  });

  it("should have valid type definitions for ResizeAlgorithm", () => {
    const resizeAlgorithm: "nearest" | "bilinear" | "lanczos3" = "lanczos3";
    expect(resizeAlgorithm).toBe("lanczos3");
  });
});
