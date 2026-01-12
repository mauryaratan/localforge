import { describe, expect, it } from "vitest";
import {
  COLOR_PRESETS,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_ICON_CONFIG,
  DEFAULT_LOGO_CONFIG,
  EXPORT_SIZES,
  GRADIENT_PRESETS,
  generateLogoSVG,
  ICON_CATEGORIES,
  ICON_PATHS,
  isValidHexColor,
  isValidImageFile,
  type LogoConfig,
} from "../lib/logo-maker";

describe("logo-maker", () => {
  describe("constants", () => {
    it("should have all icon paths defined", () => {
      const allIcons = Object.values(ICON_CATEGORIES).flat();
      for (const icon of allIcons) {
        expect(ICON_PATHS[icon]).toBeDefined();
        expect(typeof ICON_PATHS[icon]).toBe("string");
      }
    });

    it("should have valid color presets", () => {
      for (const preset of COLOR_PRESETS) {
        expect(preset.name).toBeDefined();
        expect(isValidHexColor(preset.background)).toBe(true);
        expect(isValidHexColor(preset.icon)).toBe(true);
      }
    });

    it("should have valid gradient presets", () => {
      for (const preset of GRADIENT_PRESETS) {
        expect(preset.name).toBeDefined();
        expect(isValidHexColor(preset.start)).toBe(true);
        expect(isValidHexColor(preset.end)).toBe(true);
        expect(preset.angle).toBeGreaterThanOrEqual(0);
        expect(preset.angle).toBeLessThanOrEqual(360);
      }
    });

    it("should have export sizes defined", () => {
      expect(EXPORT_SIZES.length).toBeGreaterThan(0);
      for (const size of EXPORT_SIZES) {
        expect(size.value).toBeGreaterThan(0);
        expect(size.label).toBeDefined();
      }
    });
  });

  describe("default configs", () => {
    it("should have valid default icon config", () => {
      expect(DEFAULT_ICON_CONFIG.type).toBe("icon");
      expect(DEFAULT_ICON_CONFIG.value).toBe("star");
      expect(DEFAULT_ICON_CONFIG.size).toBeGreaterThan(0);
      expect(DEFAULT_ICON_CONFIG.size).toBeLessThanOrEqual(100);
      expect(DEFAULT_ICON_CONFIG.rotation).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_ICON_CONFIG.rotation).toBeLessThanOrEqual(360);
      expect(DEFAULT_ICON_CONFIG.fillOpacity).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_ICON_CONFIG.fillOpacity).toBeLessThanOrEqual(100);
      expect(isValidHexColor(DEFAULT_ICON_CONFIG.fillColor)).toBe(true);
      expect(isValidHexColor(DEFAULT_ICON_CONFIG.borderColor)).toBe(true);
    });

    it("should have valid default background config", () => {
      expect(["solid", "gradient"]).toContain(DEFAULT_BACKGROUND_CONFIG.type);
      expect(isValidHexColor(DEFAULT_BACKGROUND_CONFIG.color)).toBe(true);
      expect(DEFAULT_BACKGROUND_CONFIG.radius).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_BACKGROUND_CONFIG.radius).toBeLessThanOrEqual(50);
      expect(DEFAULT_BACKGROUND_CONFIG.padding).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_BACKGROUND_CONFIG.padding).toBeLessThanOrEqual(50);
    });

    it("should have valid default logo config", () => {
      expect(DEFAULT_LOGO_CONFIG.canvasSize).toBeGreaterThan(0);
      expect(DEFAULT_LOGO_CONFIG.icon).toEqual(DEFAULT_ICON_CONFIG);
      expect(DEFAULT_LOGO_CONFIG.background).toEqual(DEFAULT_BACKGROUND_CONFIG);
    });
  });

  describe("isValidHexColor", () => {
    it("should validate correct hex colors", () => {
      expect(isValidHexColor("#000000")).toBe(true);
      expect(isValidHexColor("#ffffff")).toBe(true);
      expect(isValidHexColor("#FFFFFF")).toBe(true);
      expect(isValidHexColor("#abc")).toBe(true);
      expect(isValidHexColor("#ABC")).toBe(true);
      expect(isValidHexColor("#123456")).toBe(true);
      expect(isValidHexColor("#abcdef")).toBe(true);
    });

    it("should reject invalid hex colors", () => {
      expect(isValidHexColor("")).toBe(false);
      expect(isValidHexColor("#")).toBe(false);
      expect(isValidHexColor("#12")).toBe(false);
      expect(isValidHexColor("#1234567")).toBe(false);
      expect(isValidHexColor("000000")).toBe(false);
      expect(isValidHexColor("#gggggg")).toBe(false);
      expect(isValidHexColor("rgb(0,0,0)")).toBe(false);
      expect(isValidHexColor("red")).toBe(false);
    });
  });

  describe("isValidImageFile", () => {
    it("should accept valid image files", () => {
      const validTypes = [
        { type: "image/png" },
        { type: "image/jpeg" },
        { type: "image/svg+xml" },
        { type: "image/gif" },
        { type: "image/webp" },
      ];
      for (const file of validTypes) {
        expect(isValidImageFile(file as File)).toBe(true);
      }
    });

    it("should reject invalid file types", () => {
      const invalidTypes = [
        { type: "application/pdf" },
        { type: "text/plain" },
        { type: "video/mp4" },
        { type: "audio/mp3" },
      ];
      for (const file of invalidTypes) {
        expect(isValidImageFile(file as File)).toBe(false);
      }
    });
  });

  describe("generateLogoSVG", () => {
    it("should generate valid SVG with default config", () => {
      const svg = generateLogoSVG(DEFAULT_LOGO_CONFIG);
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain(`width="${DEFAULT_LOGO_CONFIG.canvasSize}"`);
      expect(svg).toContain(`height="${DEFAULT_LOGO_CONFIG.canvasSize}"`);
    });

    it("should generate SVG with custom canvas size", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        canvasSize: 256,
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain('width="256"');
      expect(svg).toContain('height="256"');
    });

    it("should generate SVG with solid background", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          type: "solid",
          color: "#ff0000",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain('fill="#ff0000"');
    });

    it("should generate SVG with gradient background", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          type: "gradient",
          color: "#ff0000",
          gradientEndColor: "#0000ff",
          gradientAngle: 90,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<linearGradient");
      expect(svg).toContain("url(#logoGradient)");
      expect(svg).toContain("stop-color:#ff0000");
      expect(svg).toContain("stop-color:#0000ff");
    });

    it("should generate SVG with icon", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          type: "icon",
          value: "star",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<path");
      expect(svg).toContain(ICON_PATHS.star);
    });

    it("should generate SVG with text", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          type: "text",
          value: "ABC",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<text");
      expect(svg).toContain("ABC");
    });

    it("should generate SVG with rotation", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          rotation: 45,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("rotate(45)");
    });

    it("should generate SVG with border", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          borderWidth: 2,
          borderColor: "#ff0000",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain('stroke="#ff0000"');
      expect(svg).toContain('stroke-width="2"');
    });

    it("should generate SVG with inner shadow", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          innerShadow: true,
          innerShadowIntensity: 50,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain('id="innerShadowGrad"');
      expect(svg).toContain('fill="url(#innerShadowGrad)"');
    });

    it("should generate SVG with corner radius", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          radius: 25,
        },
      };
      const svg = generateLogoSVG(config);
      // radius 25% of half canvas size = 25% * 256 = 64
      const expectedRadius = (25 / 100) * (DEFAULT_LOGO_CONFIG.canvasSize / 2);
      expect(svg).toContain(`rx="${expectedRadius}"`);
      expect(svg).toContain(`ry="${expectedRadius}"`);
    });

    it("should escape XML special characters in text", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          type: "text",
          value: "<>&",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("&lt;");
      expect(svg).toContain("&gt;");
      expect(svg).toContain("&amp;");
    });

    it("should apply fill opacity", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          fillOpacity: 50,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain('fill-opacity="0.5"');
    });
  });

  describe("icon categories", () => {
    it("should have valid icon categories", () => {
      const categories = Object.keys(ICON_CATEGORIES);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain("shapes");
      expect(categories).toContain("tech");
      expect(categories).toContain("ui");
    });

    it("should have icons in each category", () => {
      for (const category of Object.keys(ICON_CATEGORIES)) {
        const icons = ICON_CATEGORIES[category as keyof typeof ICON_CATEGORIES];
        expect(icons.length).toBeGreaterThan(0);
      }
    });
  });

  describe("edge cases", () => {
    it("should handle minimum values", () => {
      const config: LogoConfig = {
        canvasSize: 16,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          size: 20,
          rotation: 0,
          borderWidth: 0,
          fillOpacity: 0,
        },
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          radius: 0,
          padding: 0,
          innerShadow: false,
          innerShadowIntensity: 0,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<svg");
    });

    it("should handle maximum values", () => {
      const config: LogoConfig = {
        canvasSize: 1024,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          size: 100,
          rotation: 360,
          borderWidth: 10,
          fillOpacity: 100,
        },
        background: {
          ...DEFAULT_BACKGROUND_CONFIG,
          radius: 50,
          padding: 40,
          innerShadow: true,
          innerShadowIntensity: 100,
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<svg");
    });

    it("should handle image type icon", () => {
      const config: LogoConfig = {
        ...DEFAULT_LOGO_CONFIG,
        icon: {
          ...DEFAULT_ICON_CONFIG,
          type: "image",
          value: "data:image/png;base64,abc123",
        },
      };
      const svg = generateLogoSVG(config);
      expect(svg).toContain("<image");
      expect(svg).toContain("data:image/png;base64,abc123");
    });
  });
});
