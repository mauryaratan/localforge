import { describe, expect, it } from "vitest";
import {
  base64EncodeSvg,
  convertSvgToCss,
  createDataUri,
  decodeSvgFromDataUri,
  ensureXmlns,
  formatBytes,
  urlEncodeSvg,
  validateSvg,
} from "@/lib/svg-css";

describe("validateSvg", () => {
  it("should return valid for proper SVG", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = validateSvg(svg);
    expect(result.isValid).toBe(true);
  });

  it("should return valid for SVG with XML declaration", () => {
    const svg =
      '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = validateSvg(svg);
    expect(result.isValid).toBe(true);
  });

  it("should return valid for self-closing SVG", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" />';
    const result = validateSvg(svg);
    expect(result.isValid).toBe(true);
  });

  it("should return error for empty input", () => {
    const result = validateSvg("");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter SVG code");
  });

  it("should return error for whitespace only", () => {
    const result = validateSvg("   ");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter SVG code");
  });

  it("should return error for non-SVG input", () => {
    const result = validateSvg("<div>Not an SVG</div>");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Input must start with <svg or <?xml");
  });

  it("should return error for unclosed SVG", () => {
    const result = validateSvg("<svg><rect>");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("SVG tag is not properly closed");
  });
});

describe("ensureXmlns", () => {
  it("should add xmlns if missing", () => {
    const svg = "<svg><rect /></svg>";
    const result = ensureXmlns(svg);
    expect(result).toContain("xmlns='http://www.w3.org/2000/svg'");
  });

  it("should not modify SVG that already has xmlns", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = ensureXmlns(svg);
    expect(result).toBe(svg);
  });

  it("should handle lowercase svg tag", () => {
    const svg = "<svg viewBox='0 0 100 100'></svg>";
    const result = ensureXmlns(svg);
    expect(result).toContain("xmlns='http://www.w3.org/2000/svg'");
  });
});

describe("urlEncodeSvg", () => {
  it("should encode special characters", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = urlEncodeSvg(svg);
    expect(result).toContain("%3C");
    expect(result).toContain("%3E");
  });

  it("should replace double quotes with single quotes", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const result = urlEncodeSvg(svg);
    expect(result).not.toContain('"');
    expect(result).toContain("'");
  });

  it("should encode hash symbols", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><rect fill="#f00" /></svg>';
    const result = urlEncodeSvg(svg);
    expect(result).toContain("%23");
  });

  it("should trim whitespace and collapse multiple spaces", () => {
    const svg =
      '  <svg xmlns="http://www.w3.org/2000/svg">  <rect />  </svg>  ';
    const result = urlEncodeSvg(svg);
    expect(result).not.toMatch(/\s{2,}/);
  });
});

describe("base64EncodeSvg", () => {
  it("should return base64 encoded string", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = base64EncodeSvg(svg);
    expect(result).toBeTruthy();
    // Should be valid base64
    expect(() => atob(result)).not.toThrow();
  });

  it("should handle unicode characters", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg"><text>日本語</text></svg>';
    const result = base64EncodeSvg(svg);
    expect(result).toBeTruthy();
    // Should decode back properly
    const decoded = decodeURIComponent(escape(atob(result)));
    expect(decoded).toContain("日本語");
  });
});

describe("createDataUri", () => {
  it("should create URL-encoded data URI", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = createDataUri(svg, "url");
    expect(result).toMatch(/^data:image\/svg\+xml,/);
  });

  it("should create base64 data URI", () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';
    const result = createDataUri(svg, "base64");
    expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});

describe("convertSvgToCss", () => {
  const validSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" /></svg>';

  it("should convert valid SVG successfully", () => {
    const result = convertSvgToCss(validSvg);
    expect(result.isValid).toBe(true);
    expect(result.dataUri).toBeTruthy();
  });

  it("should calculate original and encoded sizes", () => {
    const result = convertSvgToCss(validSvg);
    expect(result.originalSize).toBeGreaterThan(0);
    expect(result.encodedSize).toBeGreaterThan(0);
  });

  it("should generate all CSS output formats", () => {
    const result = convertSvgToCss(validSvg);
    expect(result.css.dataUri).toBeTruthy();
    expect(result.css.backgroundImage).toContain("background-image:");
    expect(result.css.backgroundImageFull).toContain("background-size:");
    expect(result.css.maskImage).toContain("mask-image:");
    expect(result.css.listStyleImage).toContain("list-style-image:");
  });

  it("should return error for invalid SVG", () => {
    const result = convertSvgToCss("invalid svg");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.dataUri).toBe("");
  });

  it("should use URL encoding by default", () => {
    const result = convertSvgToCss(validSvg);
    expect(result.dataUri).toMatch(/^data:image\/svg\+xml,/);
  });

  it("should use base64 encoding when specified", () => {
    const result = convertSvgToCss(validSvg, "base64");
    expect(result.dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});

describe("decodeSvgFromDataUri", () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>';

  it("should decode URL-encoded data URI", () => {
    const dataUri = createDataUri(svg, "url");
    const result = decodeSvgFromDataUri(dataUri);
    expect(result).toContain("<svg");
    expect(result).toContain("</svg>");
  });

  it("should decode base64 data URI", () => {
    const dataUri = createDataUri(svg, "base64");
    const result = decodeSvgFromDataUri(dataUri);
    expect(result).toContain("<svg");
    expect(result).toContain("</svg>");
  });

  it("should return empty string for invalid data URI", () => {
    const result = decodeSvgFromDataUri("invalid");
    expect(result).toBe("");
  });
});

describe("formatBytes", () => {
  it("should format bytes correctly", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(100)).toBe("100 B");
    expect(formatBytes(1024)).toBe("1.00 KB");
    expect(formatBytes(1536)).toBe("1.50 KB");
    expect(formatBytes(1_048_576)).toBe("1.00 MB");
  });
});
