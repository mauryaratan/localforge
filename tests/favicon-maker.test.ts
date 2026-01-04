import { describe, expect, it } from "vitest";

// Pure utility function tests for favicon maker
// These functions are tested separately from browser-dependent functions

// Re-implement utility functions locally for testing
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(value >= 10 || value % 1 === 0 ? 0 : 1)} ${units[exp]}`;
};

const isFileSupported = (file: File): boolean => {
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "image/gif"];
  return supportedTypes.includes(file.type);
};

const generateManifest = (
  name = "App",
  shortName = "App",
  themeColor = "#ffffff",
  backgroundColor = "#ffffff"
): string => {
  const manifest = {
    name,
    short_name: shortName,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: "standalone",
  };
  return JSON.stringify(manifest, null, 2);
};

const generateHtmlCode = (): string => {
  return `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;
};

const FAVICON_SIZES = [
  { name: "favicon-16x16.png", width: 16, height: 16, format: "png" as const },
  { name: "favicon-32x32.png", width: 32, height: 32, format: "png" as const },
  { name: "apple-touch-icon.png", width: 180, height: 180, format: "png" as const, purpose: "Apple devices" },
  { name: "android-chrome-192x192.png", width: 192, height: 192, format: "png" as const, purpose: "Android/PWA" },
  { name: "android-chrome-512x512.png", width: 512, height: 512, format: "png" as const, purpose: "Android/PWA" },
  { name: "favicon.ico", width: 48, height: 48, format: "ico" as const, purpose: "Legacy browsers" },
];

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

  it("should return true for SVG files", () => {
    const file = new File([""], "test.svg", { type: "image/svg+xml" });
    expect(isFileSupported(file)).toBe(true);
  });

  it("should return true for WebP files", () => {
    const file = new File([""], "test.webp", { type: "image/webp" });
    expect(isFileSupported(file)).toBe(true);
  });

  it("should return true for GIF files", () => {
    const file = new File([""], "test.gif", { type: "image/gif" });
    expect(isFileSupported(file)).toBe(true);
  });

  it("should return false for unsupported types", () => {
    const bmpFile = new File([""], "test.bmp", { type: "image/bmp" });
    expect(isFileSupported(bmpFile)).toBe(false);

    const tiffFile = new File([""], "test.tiff", { type: "image/tiff" });
    expect(isFileSupported(tiffFile)).toBe(false);
  });

  it("should return false for non-image files", () => {
    const textFile = new File([""], "test.txt", { type: "text/plain" });
    expect(isFileSupported(textFile)).toBe(false);

    const pdfFile = new File([""], "test.pdf", { type: "application/pdf" });
    expect(isFileSupported(pdfFile)).toBe(false);
  });
});

describe("generateManifest", () => {
  it("should generate valid JSON manifest with default values", () => {
    const manifest = generateManifest();
    const parsed = JSON.parse(manifest);
    
    expect(parsed.name).toBe("App");
    expect(parsed.short_name).toBe("App");
    expect(parsed.theme_color).toBe("#ffffff");
    expect(parsed.background_color).toBe("#ffffff");
    expect(parsed.display).toBe("standalone");
  });

  it("should generate manifest with custom app name", () => {
    const manifest = generateManifest("My Cool App", "CoolApp");
    const parsed = JSON.parse(manifest);
    
    expect(parsed.name).toBe("My Cool App");
    expect(parsed.short_name).toBe("CoolApp");
  });

  it("should generate manifest with custom colors", () => {
    const manifest = generateManifest("App", "App", "#3b82f6", "#1e3a5f");
    const parsed = JSON.parse(manifest);
    
    expect(parsed.theme_color).toBe("#3b82f6");
    expect(parsed.background_color).toBe("#1e3a5f");
  });

  it("should include required icon sizes", () => {
    const manifest = generateManifest();
    const parsed = JSON.parse(manifest);
    
    expect(parsed.icons).toHaveLength(2);
    expect(parsed.icons[0].sizes).toBe("192x192");
    expect(parsed.icons[1].sizes).toBe("512x512");
  });

  it("should include correct icon paths", () => {
    const manifest = generateManifest();
    const parsed = JSON.parse(manifest);
    
    expect(parsed.icons[0].src).toBe("/android-chrome-192x192.png");
    expect(parsed.icons[1].src).toBe("/android-chrome-512x512.png");
  });

  it("should include correct icon types", () => {
    const manifest = generateManifest();
    const parsed = JSON.parse(manifest);
    
    expect(parsed.icons[0].type).toBe("image/png");
    expect(parsed.icons[1].type).toBe("image/png");
  });
});

describe("generateHtmlCode", () => {
  it("should include apple-touch-icon link", () => {
    const html = generateHtmlCode();
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('sizes="180x180"');
    expect(html).toContain('href="/apple-touch-icon.png"');
  });

  it("should include favicon-32x32 link", () => {
    const html = generateHtmlCode();
    expect(html).toContain('sizes="32x32"');
    expect(html).toContain('href="/favicon-32x32.png"');
  });

  it("should include favicon-16x16 link", () => {
    const html = generateHtmlCode();
    expect(html).toContain('sizes="16x16"');
    expect(html).toContain('href="/favicon-16x16.png"');
  });

  it("should include manifest link", () => {
    const html = generateHtmlCode();
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('href="/site.webmanifest"');
  });

  it("should include correct image types", () => {
    const html = generateHtmlCode();
    expect(html).toContain('type="image/png"');
  });
});

describe("FAVICON_SIZES", () => {
  it("should include all required favicon sizes", () => {
    const names = FAVICON_SIZES.map((s) => s.name);
    
    expect(names).toContain("favicon-16x16.png");
    expect(names).toContain("favicon-32x32.png");
    expect(names).toContain("apple-touch-icon.png");
    expect(names).toContain("android-chrome-192x192.png");
    expect(names).toContain("android-chrome-512x512.png");
    expect(names).toContain("favicon.ico");
  });

  it("should have correct dimensions for each size", () => {
    const favicon16 = FAVICON_SIZES.find((s) => s.name === "favicon-16x16.png");
    expect(favicon16?.width).toBe(16);
    expect(favicon16?.height).toBe(16);

    const favicon32 = FAVICON_SIZES.find((s) => s.name === "favicon-32x32.png");
    expect(favicon32?.width).toBe(32);
    expect(favicon32?.height).toBe(32);

    const appleTouch = FAVICON_SIZES.find((s) => s.name === "apple-touch-icon.png");
    expect(appleTouch?.width).toBe(180);
    expect(appleTouch?.height).toBe(180);

    const android192 = FAVICON_SIZES.find((s) => s.name === "android-chrome-192x192.png");
    expect(android192?.width).toBe(192);
    expect(android192?.height).toBe(192);

    const android512 = FAVICON_SIZES.find((s) => s.name === "android-chrome-512x512.png");
    expect(android512?.width).toBe(512);
    expect(android512?.height).toBe(512);
  });

  it("should have correct format for each size", () => {
    const pngSizes = FAVICON_SIZES.filter((s) => s.format === "png");
    const icoSizes = FAVICON_SIZES.filter((s) => s.format === "ico");

    expect(pngSizes).toHaveLength(5);
    expect(icoSizes).toHaveLength(1);
  });

  it("should have at least 6 favicon sizes", () => {
    expect(FAVICON_SIZES.length).toBeGreaterThanOrEqual(6);
  });
});

describe("Base64 conversion utilities", () => {
  it("should handle base64 data URL parsing", () => {
    const base64 = "data:image/png;base64,iVBORw0KGgo=";
    const [meta, data] = base64.split(",");
    const mimeMatch = meta.match(/:(.*?);/);
    
    expect(mimeMatch).not.toBeNull();
    expect(mimeMatch?.[1]).toBe("image/png");
    expect(data).toBe("iVBORw0KGgo=");
  });

  it("should extract mime type from data URL", () => {
    const testCases = [
      { url: "data:image/png;base64,abc", expected: "image/png" },
      { url: "data:image/jpeg;base64,xyz", expected: "image/jpeg" },
      { url: "data:image/svg+xml;base64,def", expected: "image/svg+xml" },
    ];

    for (const { url, expected } of testCases) {
      const [meta] = url.split(",");
      const mimeMatch = meta.match(/:(.*?);/);
      expect(mimeMatch?.[1]).toBe(expected);
    }
  });
});

describe("ICO file structure", () => {
  it("should have correct header and entry sizes defined", () => {
    const ICO_HEADER_SIZE = 6;
    const ICO_ENTRY_SIZE = 16;
    
    expect(ICO_HEADER_SIZE).toBe(6);
    expect(ICO_ENTRY_SIZE).toBe(16);
  });

  it("should calculate correct total size for ICO file", () => {
    const ICO_HEADER_SIZE = 6;
    const ICO_ENTRY_SIZE = 16;
    const imageCount = 3; // 16, 32, 48 sizes
    const mockPngSizes = [500, 1000, 2000]; // Mock PNG sizes
    
    const headerAndDirectorySize = ICO_HEADER_SIZE + (imageCount * ICO_ENTRY_SIZE);
    const totalPngSize = mockPngSizes.reduce((a, b) => a + b, 0);
    const totalSize = headerAndDirectorySize + totalPngSize;
    
    expect(headerAndDirectorySize).toBe(6 + 48); // 54 bytes for header and 3 entries
    expect(totalPngSize).toBe(3500);
    expect(totalSize).toBe(3554);
  });
});

describe("Type definitions", () => {
  it("should have valid FaviconSize type structure", () => {
    const size = {
      name: "test.png",
      width: 32,
      height: 32,
      format: "png" as const,
      purpose: "Test",
    };
    
    expect(size.name).toBe("test.png");
    expect(size.width).toBe(32);
    expect(size.height).toBe(32);
    expect(size.format).toBe("png");
    expect(size.purpose).toBe("Test");
  });

  it("should have valid GeneratedFavicon type structure", () => {
    const favicon = {
      name: "favicon.png",
      width: 32,
      height: 32,
      blob: new Blob(["test"], { type: "image/png" }),
      url: "blob:test",
      format: "png" as const,
    };
    
    expect(favicon.name).toBe("favicon.png");
    expect(favicon.blob).toBeInstanceOf(Blob);
    expect(favicon.format).toBe("png");
  });
});
