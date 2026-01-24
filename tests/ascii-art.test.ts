import { describe, expect, it } from "vitest";
import {
  brightnessToChar,
  CHARACTER_SET_LABELS,
  CHARACTER_SETS,
  calculateBrightness,
  DEFAULT_OPTIONS,
  DEFAULT_TEXT_OPTIONS,
  getAvailableFonts,
  getCharacterSet,
  getExtensionFromMime,
  isImageSupported,
  rgbToAnsi256,
  SUPPORTED_IMAGE_TYPES,
  TEXT_FONT_LABELS,
  textToAscii,
  WIDTH_PRESETS,
} from "@/lib/ascii-art";

describe("calculateBrightness", () => {
  it("should return 0 for pure black", () => {
    expect(calculateBrightness(0, 0, 0)).toBe(0);
  });

  it("should return 255 for pure white", () => {
    expect(calculateBrightness(255, 255, 255)).toBe(255);
  });

  it("should calculate correct luminance for red", () => {
    // 0.299 * 255 = 76.245
    expect(calculateBrightness(255, 0, 0)).toBeCloseTo(76.245, 1);
  });

  it("should calculate correct luminance for green", () => {
    // 0.587 * 255 = 149.685
    expect(calculateBrightness(0, 255, 0)).toBeCloseTo(149.685, 1);
  });

  it("should calculate correct luminance for blue", () => {
    // 0.114 * 255 = 29.07
    expect(calculateBrightness(0, 0, 255)).toBeCloseTo(29.07, 1);
  });

  it("should calculate mid-gray correctly", () => {
    // Gray: 0.299*128 + 0.587*128 + 0.114*128 = 128
    expect(calculateBrightness(128, 128, 128)).toBeCloseTo(128, 0);
  });

  it("should weight green higher than red and blue", () => {
    const greenBrightness = calculateBrightness(0, 200, 0);
    const redBrightness = calculateBrightness(200, 0, 0);
    const blueBrightness = calculateBrightness(0, 0, 200);

    expect(greenBrightness).toBeGreaterThan(redBrightness);
    expect(redBrightness).toBeGreaterThan(blueBrightness);
  });
});

describe("brightnessToChar", () => {
  const charSet = "@#=-. "; // 6 characters, dark to light

  it("should return @ for brightest value when not inverted", () => {
    // Non-inverted: adjustedBrightness = 1 - normalizedBrightness = 0, maps to first char
    expect(brightnessToChar(255, charSet, false)).toBe("@");
  });

  it("should return space for darkest value when not inverted", () => {
    // Non-inverted: adjustedBrightness = 1 - 0 = 1, maps to last char (space)
    expect(brightnessToChar(0, charSet, false)).toBe(" ");
  });

  it("should return space for brightest value when inverted", () => {
    // Inverted: adjustedBrightness = normalizedBrightness = 1, maps to last char
    expect(brightnessToChar(255, charSet, true)).toBe(" ");
  });

  it("should return @ for darkest value when inverted", () => {
    // Inverted: adjustedBrightness = 0, maps to first char
    expect(brightnessToChar(0, charSet, true)).toBe("@");
  });

  it("should return space for empty character set", () => {
    expect(brightnessToChar(128, "", false)).toBe(" ");
  });

  it("should handle mid-range brightness", () => {
    const result = brightnessToChar(128, charSet, false);
    // Should be somewhere in the middle of the character set
    expect(charSet).toContain(result);
  });
});

describe("rgbToAnsi256", () => {
  it("should return 16 for pure black", () => {
    expect(rgbToAnsi256(0, 0, 0)).toBe(16);
  });

  it("should return 231 for pure white", () => {
    expect(rgbToAnsi256(255, 255, 255)).toBe(231);
  });

  it("should return grayscale values for gray colors", () => {
    // Mid-gray should be in grayscale range (232-255)
    const result = rgbToAnsi256(128, 128, 128);
    expect(result).toBeGreaterThanOrEqual(232);
    expect(result).toBeLessThanOrEqual(255);
  });

  it("should return color cube value for red", () => {
    const result = rgbToAnsi256(255, 0, 0);
    // 16 + 36*5 + 6*0 + 0 = 196
    expect(result).toBe(196);
  });

  it("should return color cube value for green", () => {
    const result = rgbToAnsi256(0, 255, 0);
    // 16 + 36*0 + 6*5 + 0 = 46
    expect(result).toBe(46);
  });

  it("should return color cube value for blue", () => {
    const result = rgbToAnsi256(0, 0, 255);
    // 16 + 36*0 + 6*0 + 5 = 21
    expect(result).toBe(21);
  });
});

describe("getCharacterSet", () => {
  it("should return standard character set by default", () => {
    const options = { ...DEFAULT_OPTIONS, characterSet: "standard" as const };
    expect(getCharacterSet(options)).toBe(CHARACTER_SETS.standard);
  });

  it("should return detailed character set", () => {
    const options = { ...DEFAULT_OPTIONS, characterSet: "detailed" as const };
    expect(getCharacterSet(options)).toBe(CHARACTER_SETS.detailed);
  });

  it("should return blocks character set", () => {
    const options = { ...DEFAULT_OPTIONS, characterSet: "blocks" as const };
    expect(getCharacterSet(options)).toBe(CHARACTER_SETS.blocks);
  });

  it("should return binary character set", () => {
    const options = { ...DEFAULT_OPTIONS, characterSet: "binary" as const };
    expect(getCharacterSet(options)).toBe(CHARACTER_SETS.binary);
  });

  it("should return custom characters when specified", () => {
    const options = {
      ...DEFAULT_OPTIONS,
      characterSet: "custom" as const,
      customCharacters: "ABC ",
    };
    expect(getCharacterSet(options)).toBe("ABC ");
  });

  it("should fall back to standard when custom has no characters", () => {
    const options = { ...DEFAULT_OPTIONS, characterSet: "custom" as const };
    // Falls back to standard because CHARACTER_SETS.custom is "" (falsy)
    expect(getCharacterSet(options)).toBe(CHARACTER_SETS.standard);
  });
});

describe("CHARACTER_SETS", () => {
  it("should have standard character set", () => {
    expect(CHARACTER_SETS.standard).toBeDefined();
    expect(CHARACTER_SETS.standard.length).toBeGreaterThan(0);
  });

  it("should have detailed character set with more characters", () => {
    expect(CHARACTER_SETS.detailed).toBeDefined();
    expect(CHARACTER_SETS.detailed.length).toBeGreaterThan(
      CHARACTER_SETS.standard.length
    );
  });

  it("should have blocks character set", () => {
    expect(CHARACTER_SETS.blocks).toBeDefined();
    expect(CHARACTER_SETS.blocks).toContain("█");
  });

  it("should have binary character set with only 01", () => {
    expect(CHARACTER_SETS.binary).toBe("01");
  });

  it("should have minimal character set", () => {
    expect(CHARACTER_SETS.minimal).toBeDefined();
    expect(CHARACTER_SETS.minimal.length).toBeLessThan(
      CHARACTER_SETS.standard.length
    );
  });

  it("should have arrows character set", () => {
    expect(CHARACTER_SETS.arrows).toBeDefined();
    expect(CHARACTER_SETS.arrows.length).toBeGreaterThan(0);
  });

  it("should have empty custom character set", () => {
    expect(CHARACTER_SETS.custom).toBe("");
  });
});

describe("CHARACTER_SET_LABELS", () => {
  it("should have labels for all character sets", () => {
    const setKeys = Object.keys(CHARACTER_SETS);
    const labelKeys = Object.keys(CHARACTER_SET_LABELS);

    expect(labelKeys).toEqual(expect.arrayContaining(setKeys));
  });

  it("should have descriptive labels", () => {
    expect(CHARACTER_SET_LABELS.standard).toBe("Standard");
    expect(CHARACTER_SET_LABELS.detailed).toContain("Detailed");
    expect(CHARACTER_SET_LABELS.blocks).toContain("Blocks");
    expect(CHARACTER_SET_LABELS.binary).toContain("Binary");
  });
});

describe("WIDTH_PRESETS", () => {
  it("should have at least 4 presets", () => {
    expect(WIDTH_PRESETS.length).toBeGreaterThanOrEqual(4);
  });

  it("should have valid structure", () => {
    WIDTH_PRESETS.forEach((preset) => {
      expect(preset).toHaveProperty("label");
      expect(preset).toHaveProperty("value");
      expect(typeof preset.label).toBe("string");
      expect(typeof preset.value).toBe("number");
    });
  });

  it("should have reasonable width values", () => {
    WIDTH_PRESETS.forEach((preset) => {
      expect(preset.value).toBeGreaterThanOrEqual(30);
      expect(preset.value).toBeLessThanOrEqual(300);
    });
  });

  it("should be sorted by value", () => {
    const values = WIDTH_PRESETS.map((p) => p.value);
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });
});

describe("DEFAULT_OPTIONS", () => {
  it("should have reasonable default width", () => {
    expect(DEFAULT_OPTIONS.width).toBeGreaterThanOrEqual(50);
    expect(DEFAULT_OPTIONS.width).toBeLessThanOrEqual(200);
  });

  it("should have standard character set as default", () => {
    expect(DEFAULT_OPTIONS.characterSet).toBe("standard");
  });

  it("should not be inverted by default", () => {
    expect(DEFAULT_OPTIONS.invert).toBe(false);
  });

  it("should preserve aspect ratio by default", () => {
    expect(DEFAULT_OPTIONS.preserveAspectRatio).toBe(true);
  });

  it("should use monochrome color mode by default", () => {
    expect(DEFAULT_OPTIONS.colorMode).toBe("monochrome");
  });
});

describe("isImageSupported", () => {
  it("should return true for PNG files", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    expect(isImageSupported(file)).toBe(true);
  });

  it("should return true for JPEG files", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    expect(isImageSupported(file)).toBe(true);
  });

  it("should return true for GIF files", () => {
    const file = new File([""], "test.gif", { type: "image/gif" });
    expect(isImageSupported(file)).toBe(true);
  });

  it("should return true for WebP files", () => {
    const file = new File([""], "test.webp", { type: "image/webp" });
    expect(isImageSupported(file)).toBe(true);
  });

  it("should return true for BMP files", () => {
    const file = new File([""], "test.bmp", { type: "image/bmp" });
    expect(isImageSupported(file)).toBe(true);
  });

  it("should return false for unsupported types", () => {
    const svgFile = new File([""], "test.svg", { type: "image/svg+xml" });
    expect(isImageSupported(svgFile)).toBe(false);

    const textFile = new File([""], "test.txt", { type: "text/plain" });
    expect(isImageSupported(textFile)).toBe(false);

    const pdfFile = new File([""], "test.pdf", { type: "application/pdf" });
    expect(isImageSupported(pdfFile)).toBe(false);
  });
});

describe("SUPPORTED_IMAGE_TYPES", () => {
  it("should include common image formats", () => {
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/png");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/jpeg");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/gif");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/webp");
    expect(SUPPORTED_IMAGE_TYPES).toContain("image/bmp");
  });

  it("should have at least 5 supported types", () => {
    expect(SUPPORTED_IMAGE_TYPES.length).toBeGreaterThanOrEqual(5);
  });
});

describe("getExtensionFromMime", () => {
  it("should return png for image/png", () => {
    expect(getExtensionFromMime("image/png")).toBe("png");
  });

  it("should return jpg for image/jpeg", () => {
    expect(getExtensionFromMime("image/jpeg")).toBe("jpg");
  });

  it("should return gif for image/gif", () => {
    expect(getExtensionFromMime("image/gif")).toBe("gif");
  });

  it("should return webp for image/webp", () => {
    expect(getExtensionFromMime("image/webp")).toBe("webp");
  });

  it("should return bmp for image/bmp", () => {
    expect(getExtensionFromMime("image/bmp")).toBe("bmp");
  });

  it("should return png for unknown mime types", () => {
    expect(getExtensionFromMime("image/unknown")).toBe("png");
    expect(getExtensionFromMime("text/plain")).toBe("png");
  });
});

describe("Type definitions", () => {
  it("should have valid CharacterSet type", () => {
    const charSet:
      | "standard"
      | "detailed"
      | "blocks"
      | "binary"
      | "minimal"
      | "arrows"
      | "custom" = "standard";
    expect(charSet).toBe("standard");
  });

  it("should have valid OutputFormat type", () => {
    const format: "text" | "html" = "text";
    expect(format).toBe("text");
  });

  it("should have valid color mode type", () => {
    const colorMode: "monochrome" | "grayscale" | "color" = "monochrome";
    expect(colorMode).toBe("monochrome");
  });
});

describe("Integration scenarios", () => {
  it("should generate consistent output for same input", () => {
    const brightness1 = calculateBrightness(100, 150, 200);
    const brightness2 = calculateBrightness(100, 150, 200);
    expect(brightness1).toBe(brightness2);

    const char1 = brightnessToChar(brightness1, "@#. ", false);
    const char2 = brightnessToChar(brightness2, "@#. ", false);
    expect(char1).toBe(char2);
  });

  it("should handle edge cases in brightness calculation", () => {
    // Test boundaries
    expect(calculateBrightness(0, 0, 0)).toBe(0);
    expect(calculateBrightness(255, 255, 255)).toBe(255);

    // Test that values stay in valid range
    const brightness = calculateBrightness(300, 300, 300); // Invalid but shouldn't crash
    expect(brightness).toBeGreaterThan(255); // Will exceed due to calculation
  });

  it("should map full brightness range to character set", () => {
    const charSet = "@#=-. ";
    const usedChars = new Set<string>();

    // Sample brightness values across the range
    for (let b = 0; b <= 255; b += 25) {
      const char = brightnessToChar(b, charSet, false);
      usedChars.add(char);
    }

    // Should use multiple characters from the set
    expect(usedChars.size).toBeGreaterThan(1);
  });
});

// ============================================
// TEXT TO ASCII TESTS
// ============================================

describe("textToAscii", () => {
  it("should convert text to ASCII art", () => {
    const result = textToAscii("A", { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result.split("\n").length).toBeGreaterThan(1);
  });

  it("should handle empty string", () => {
    const result = textToAscii("", { font: "standard" });
    expect(result.trim()).toBe("");
  });

  it("should convert lowercase to uppercase", () => {
    const lowercase = textToAscii("abc", { font: "standard" });
    const uppercase = textToAscii("ABC", { font: "standard" });
    expect(lowercase).toBe(uppercase);
  });

  it("should handle spaces", () => {
    const result = textToAscii("A B", { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should handle numbers", () => {
    const result = textToAscii("123", { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should work with different fonts", () => {
    const standard = textToAscii("TEST", { font: "standard" });
    const banner = textToAscii("TEST", { font: "banner" });

    expect(standard).toBeDefined();
    expect(banner).toBeDefined();
    // Different fonts should produce different outputs
    expect(standard).not.toBe(banner);
  });

  it("should generate multi-line output", () => {
    const result = textToAscii("A", { font: "standard" });
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });

  it("should support multiline input", () => {
    const singleLine = textToAscii("A", { font: "standard" });
    const multiLine = textToAscii("A\nB", { font: "standard" });

    // Multiline should produce more lines than single line
    expect(multiLine.split("\n").length).toBeGreaterThan(
      singleLine.split("\n").length
    );
  });

  it("should handle multiple newlines", () => {
    const result = textToAscii("A\n\nB", { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it("should combine multiple lines correctly", () => {
    const hello = textToAscii("HELLO", { font: "standard" });
    const world = textToAscii("WORLD", { font: "standard" });
    const combined = textToAscii("HELLO\nWORLD", { font: "standard" });

    // Combined should contain content from both lines
    const helloLines = hello.split("\n").length;
    const worldLines = world.split("\n").length;
    const combinedLines = combined.split("\n").length;

    // Combined should have more lines than either individual
    expect(combinedLines).toBeGreaterThan(helloLines);
    expect(combinedLines).toBeGreaterThan(worldLines);
  });
});

describe("getAvailableFonts", () => {
  it("should return array of font names", () => {
    const fonts = getAvailableFonts();
    expect(Array.isArray(fonts)).toBe(true);
    expect(fonts.length).toBeGreaterThan(0);
  });

  it("should include standard font", () => {
    const fonts = getAvailableFonts();
    expect(fonts).toContain("standard");
  });

  it("should include banner font", () => {
    const fonts = getAvailableFonts();
    expect(fonts).toContain("banner");
  });
});

describe("TEXT_FONT_LABELS", () => {
  it("should have labels for available fonts", () => {
    const fonts = getAvailableFonts();
    for (const font of fonts) {
      expect(TEXT_FONT_LABELS[font]).toBeDefined();
      expect(typeof TEXT_FONT_LABELS[font]).toBe("string");
    }
  });

  it("should have descriptive labels", () => {
    expect(TEXT_FONT_LABELS.standard).toBe("Standard");
    expect(TEXT_FONT_LABELS.banner).toBe("Banner");
    expect(TEXT_FONT_LABELS.big).toBe("Big");
    expect(TEXT_FONT_LABELS.mini).toBe("Mini");
  });
});

describe("DEFAULT_TEXT_OPTIONS", () => {
  it("should have default font", () => {
    expect(DEFAULT_TEXT_OPTIONS.font).toBeDefined();
    expect(DEFAULT_TEXT_OPTIONS.font).toBe("standard");
  });
});

describe("Text ASCII art character coverage", () => {
  it("should support A-Z characters", () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const result = textToAscii(alphabet, { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(alphabet.length);
  });

  it("should support digits 0-9", () => {
    const digits = "0123456789";
    const result = textToAscii(digits, { font: "standard" });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(digits.length);
  });

  it("should handle unknown characters gracefully", () => {
    // Should not throw for unknown characters
    expect(() => textToAscii("αβγ", { font: "standard" })).not.toThrow();
  });
});
