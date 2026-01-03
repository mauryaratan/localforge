import { describe, expect, it } from "vitest";
import {
  cmykToRgb,
  formatCmyk,
  formatHsl,
  formatHsla,
  formatHsv,
  formatRgb,
  formatRgba,
  getAnalogous,
  getComplementary,
  getContrastRatio,
  getLuminance,
  getSplitComplementary,
  getTriadic,
  getWcagLevel,
  hslToRgb,
  hsvToRgb,
  parseColor,
  rgbaToHex8,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "@/lib/color-converter";

describe("parseColor", () => {
  it("should parse a 6-digit HEX color", () => {
    const result = parseColor("#ff5500");

    expect(result.isValid).toBe(true);
    expect(result.formats?.hex).toBe("#ff5500");
    expect(result.formats?.rgb).toEqual({ r: 255, g: 85, b: 0 });
  });

  it("should parse a 3-digit HEX color", () => {
    const result = parseColor("#f50");

    expect(result.isValid).toBe(true);
    expect(result.formats?.hex).toBe("#ff5500");
    expect(result.formats?.rgb).toEqual({ r: 255, g: 85, b: 0 });
  });

  it("should parse HEX without hash", () => {
    const result = parseColor("ff5500");

    expect(result.isValid).toBe(true);
    expect(result.formats?.hex).toBe("#ff5500");
  });

  it("should parse 8-digit HEX with alpha", () => {
    const result = parseColor("#ff550080");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgba.a).toBeCloseTo(0.5, 1);
    expect(result.formats?.hex8).toBe("#ff550080");
  });

  it("should parse 4-digit HEX with alpha", () => {
    const result = parseColor("#f508");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgba.a).toBeCloseTo(0.53, 1);
  });

  it("should parse RGB color", () => {
    const result = parseColor("rgb(255, 85, 0)");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgb).toEqual({ r: 255, g: 85, b: 0 });
    expect(result.formats?.hex).toBe("#ff5500");
  });

  it("should parse RGBA color", () => {
    const result = parseColor("rgba(255, 85, 0, 0.5)");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgba).toEqual({ r: 255, g: 85, b: 0, a: 0.5 });
  });

  it("should parse HSL color", () => {
    const result = parseColor("hsl(20, 100%, 50%)");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgb.r).toBe(255);
    expect(result.formats?.rgb.g).toBeCloseTo(85, 0);
    expect(result.formats?.rgb.b).toBe(0);
  });

  it("should parse HSLA color", () => {
    const result = parseColor("hsla(20, 100%, 50%, 0.5)");

    expect(result.isValid).toBe(true);
    expect(result.formats?.hsla.a).toBe(0.5);
  });

  it("should return error for empty string", () => {
    const result = parseColor("");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Please enter a color");
  });

  it("should return error for invalid color", () => {
    const result = parseColor("not-a-color");

    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Invalid color format");
  });

  it("should clamp RGB values above 255", () => {
    const result = parseColor("rgb(300, 50, 128)");

    expect(result.isValid).toBe(true);
    expect(result.formats?.rgb).toEqual({ r: 255, g: 50, b: 128 });
  });
});

describe("rgbToHsl", () => {
  it("should convert pure red to HSL", () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });

    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it("should convert pure green to HSL", () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });

    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it("should convert pure blue to HSL", () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });

    expect(hsl.h).toBe(240);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it("should convert gray to HSL with 0 saturation", () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });

    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it("should convert white to HSL", () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });

    expect(hsl.l).toBe(100);
  });

  it("should convert black to HSL", () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 0 });

    expect(hsl.l).toBe(0);
  });
});

describe("hslToRgb", () => {
  it("should convert red HSL to RGB", () => {
    const rgb = hslToRgb({ h: 0, s: 100, l: 50 });

    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("should convert green HSL to RGB", () => {
    const rgb = hslToRgb({ h: 120, s: 100, l: 50 });

    expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("should convert blue HSL to RGB", () => {
    const rgb = hslToRgb({ h: 240, s: 100, l: 50 });

    expect(rgb).toEqual({ r: 0, g: 0, b: 255 });
  });

  it("should convert gray (0 saturation) to equal RGB values", () => {
    const rgb = hslToRgb({ h: 0, s: 0, l: 50 });

    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });
});

describe("rgbToHsv", () => {
  it("should convert pure red to HSV", () => {
    const hsv = rgbToHsv({ r: 255, g: 0, b: 0 });

    expect(hsv.h).toBe(0);
    expect(hsv.s).toBe(100);
    expect(hsv.v).toBe(100);
  });

  it("should convert white to HSV with 0 saturation", () => {
    const hsv = rgbToHsv({ r: 255, g: 255, b: 255 });

    expect(hsv.s).toBe(0);
    expect(hsv.v).toBe(100);
  });

  it("should convert black to HSV with 0 value", () => {
    const hsv = rgbToHsv({ r: 0, g: 0, b: 0 });

    expect(hsv.v).toBe(0);
  });
});

describe("hsvToRgb", () => {
  it("should convert red HSV to RGB", () => {
    const rgb = hsvToRgb({ h: 0, s: 100, v: 100 });

    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });

  it("should convert green HSV to RGB", () => {
    const rgb = hsvToRgb({ h: 120, s: 100, v: 100 });

    expect(rgb).toEqual({ r: 0, g: 255, b: 0 });
  });
});

describe("rgbToCmyk", () => {
  it("should convert red to CMYK", () => {
    const cmyk = rgbToCmyk({ r: 255, g: 0, b: 0 });

    expect(cmyk).toEqual({ c: 0, m: 100, y: 100, k: 0 });
  });

  it("should convert green to CMYK", () => {
    const cmyk = rgbToCmyk({ r: 0, g: 255, b: 0 });

    expect(cmyk).toEqual({ c: 100, m: 0, y: 100, k: 0 });
  });

  it("should convert blue to CMYK", () => {
    const cmyk = rgbToCmyk({ r: 0, g: 0, b: 255 });

    expect(cmyk).toEqual({ c: 100, m: 100, y: 0, k: 0 });
  });

  it("should convert black to CMYK", () => {
    const cmyk = rgbToCmyk({ r: 0, g: 0, b: 0 });

    expect(cmyk).toEqual({ c: 0, m: 0, y: 0, k: 100 });
  });

  it("should convert white to CMYK", () => {
    const cmyk = rgbToCmyk({ r: 255, g: 255, b: 255 });

    expect(cmyk).toEqual({ c: 0, m: 0, y: 0, k: 0 });
  });
});

describe("cmykToRgb", () => {
  it("should convert cyan CMYK to RGB", () => {
    const rgb = cmykToRgb({ c: 100, m: 0, y: 0, k: 0 });

    expect(rgb).toEqual({ r: 0, g: 255, b: 255 });
  });

  it("should convert magenta CMYK to RGB", () => {
    const rgb = cmykToRgb({ c: 0, m: 100, y: 0, k: 0 });

    expect(rgb).toEqual({ r: 255, g: 0, b: 255 });
  });
});

describe("rgbToHex", () => {
  it("should convert RGB to HEX", () => {
    expect(rgbToHex({ r: 255, g: 85, b: 0 })).toBe("#ff5500");
  });

  it("should pad single digit hex values", () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe("#000000");
  });
});

describe("rgbaToHex8", () => {
  it("should convert RGBA to HEX8", () => {
    expect(rgbaToHex8({ r: 255, g: 85, b: 0, a: 1 })).toBe("#ff5500ff");
  });

  it("should convert RGBA with 50% alpha to HEX8", () => {
    expect(rgbaToHex8({ r: 255, g: 85, b: 0, a: 0.5 })).toBe("#ff550080");
  });
});

describe("format functions", () => {
  it("should format RGB correctly", () => {
    expect(formatRgb({ r: 255, g: 85, b: 0 })).toBe("rgb(255, 85, 0)");
  });

  it("should format RGBA correctly", () => {
    expect(formatRgba({ r: 255, g: 85, b: 0, a: 0.5 })).toBe(
      "rgba(255, 85, 0, 0.5)"
    );
  });

  it("should format HSL correctly", () => {
    expect(formatHsl({ h: 20, s: 100, l: 50 })).toBe("hsl(20, 100%, 50%)");
  });

  it("should format HSLA correctly", () => {
    expect(formatHsla({ h: 20, s: 100, l: 50, a: 0.5 })).toBe(
      "hsla(20, 100%, 50%, 0.5)"
    );
  });

  it("should format HSV correctly", () => {
    expect(formatHsv({ h: 20, s: 100, v: 100 })).toBe("hsv(20, 100%, 100%)");
  });

  it("should format CMYK correctly", () => {
    expect(formatCmyk({ c: 0, m: 67, y: 100, k: 0 })).toBe(
      "cmyk(0%, 67%, 100%, 0%)"
    );
  });
});

describe("getLuminance", () => {
  it("should return 1 for white", () => {
    expect(getLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
  });

  it("should return 0 for black", () => {
    expect(getLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it("should return correct luminance for gray", () => {
    const luminance = getLuminance({ r: 128, g: 128, b: 128 });
    expect(luminance).toBeGreaterThan(0);
    expect(luminance).toBeLessThan(1);
  });
});

describe("getContrastRatio", () => {
  it("should return 21 for black on white", () => {
    const ratio = getContrastRatio(
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 }
    );
    expect(ratio).toBe(21);
  });

  it("should return 1 for same colors", () => {
    const ratio = getContrastRatio(
      { r: 128, g: 128, b: 128 },
      { r: 128, g: 128, b: 128 }
    );
    expect(ratio).toBe(1);
  });
});

describe("getWcagLevel", () => {
  it("should pass all levels for ratio 21", () => {
    const levels = getWcagLevel(21);

    expect(levels.aa).toBe(true);
    expect(levels.aaLarge).toBe(true);
    expect(levels.aaa).toBe(true);
    expect(levels.aaaLarge).toBe(true);
  });

  it("should fail all except aaLarge for ratio 3.5", () => {
    const levels = getWcagLevel(3.5);

    expect(levels.aa).toBe(false);
    expect(levels.aaLarge).toBe(true);
    expect(levels.aaa).toBe(false);
    expect(levels.aaaLarge).toBe(false);
  });

  it("should fail all for ratio 1", () => {
    const levels = getWcagLevel(1);

    expect(levels.aa).toBe(false);
    expect(levels.aaLarge).toBe(false);
    expect(levels.aaa).toBe(false);
    expect(levels.aaaLarge).toBe(false);
  });
});

describe("color harmony functions", () => {
  it("should calculate complementary color", () => {
    const complementary = getComplementary({ h: 0, s: 100, l: 50 });

    expect(complementary.h).toBe(180);
    expect(complementary.s).toBe(100);
    expect(complementary.l).toBe(50);
  });

  it("should calculate triadic colors", () => {
    const triadic = getTriadic({ h: 0, s: 100, l: 50 });

    expect(triadic[0].h).toBe(120);
    expect(triadic[1].h).toBe(240);
  });

  it("should calculate analogous colors", () => {
    const analogous = getAnalogous({ h: 180, s: 100, l: 50 });

    expect(analogous[0].h).toBe(210);
    expect(analogous[1].h).toBe(150);
  });

  it("should calculate split complementary colors", () => {
    const splitComp = getSplitComplementary({ h: 0, s: 100, l: 50 });

    expect(splitComp[0].h).toBe(150);
    expect(splitComp[1].h).toBe(210);
  });

  it("should handle hue wraparound for complementary", () => {
    const complementary = getComplementary({ h: 270, s: 50, l: 50 });

    expect(complementary.h).toBe(90);
  });
});
