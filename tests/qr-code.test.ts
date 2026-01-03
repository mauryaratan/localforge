import { describe, expect, it } from "vitest";
import {
  COLOR_PRESETS,
  CONTENT_TYPE_LABELS,
  DEFAULT_OPTIONS,
  detectContentType,
  DOT_SCALE_OPTIONS,
  ERROR_CORRECTION_LABELS,
  formatQRContent,
  isValidHexColor,
  parseWiFiData,
  type QRContentType,
} from "@/lib/qr-code";

describe("formatQRContent", () => {
  it("should return empty string for empty content", () => {
    expect(formatQRContent("", "text")).toBe("");
    expect(formatQRContent("   ", "url")).toBe("");
  });

  it("should return plain text as-is", () => {
    expect(formatQRContent("Hello World", "text")).toBe("Hello World");
    expect(formatQRContent("Special chars: @#$%", "text")).toBe(
      "Special chars: @#$%"
    );
  });

  it("should add https:// to URLs without protocol", () => {
    expect(formatQRContent("example.com", "url")).toBe("https://example.com");
    expect(formatQRContent("www.example.com", "url")).toBe(
      "https://www.example.com"
    );
  });

  it("should preserve existing protocol in URLs", () => {
    expect(formatQRContent("https://example.com", "url")).toBe(
      "https://example.com"
    );
    expect(formatQRContent("http://example.com", "url")).toBe(
      "http://example.com"
    );
  });

  it("should format WiFi content correctly", () => {
    const result = formatQRContent("MyNetwork", "wifi", {
      ssid: "MyNetwork",
      password: "secret123",
      encryption: "WPA",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:WPA;S:MyNetwork;P:secret123;H:false;;");
  });

  it("should format WiFi with no password", () => {
    const result = formatQRContent("OpenNetwork", "wifi", {
      ssid: "OpenNetwork",
      password: "",
      encryption: "nopass",
      hidden: false,
    });
    expect(result).toBe("WIFI:T:nopass;S:OpenNetwork;P:;H:false;;");
  });

  it("should format WiFi with hidden network", () => {
    const result = formatQRContent("HiddenNet", "wifi", {
      ssid: "HiddenNet",
      password: "pass",
      encryption: "WPA",
      hidden: true,
    });
    expect(result).toBe("WIFI:T:WPA;S:HiddenNet;P:pass;H:true;;");
  });

  it("should format email as mailto: link", () => {
    expect(formatQRContent("test@example.com", "email")).toBe(
      "mailto:test@example.com"
    );
  });

  it("should format email with subject", () => {
    const result = formatQRContent("test@example.com", "email", {
      subject: "Hello",
    });
    expect(result).toBe("mailto:test@example.com?subject=Hello");
  });

  it("should format email with subject and body", () => {
    const result = formatQRContent("test@example.com", "email", {
      subject: "Hello",
      body: "World",
    });
    expect(result).toBe("mailto:test@example.com?subject=Hello&body=World");
  });

  it("should format phone numbers with tel: prefix", () => {
    expect(formatQRContent("+1-555-123-4567", "phone")).toBe(
      "tel:+15551234567"
    );
    expect(formatQRContent("(555) 123-4567", "phone")).toBe("tel:5551234567");
  });

  it("should format SMS with sms: prefix", () => {
    expect(formatQRContent("+1-555-123-4567", "sms")).toBe("sms:+15551234567");
  });

  it("should format SMS with body", () => {
    const result = formatQRContent("+1-555-123-4567", "sms", {
      body: "Hello there",
    });
    expect(result).toBe("sms:+15551234567?body=Hello%20there");
  });
});

describe("detectContentType", () => {
  it("should detect WiFi content", () => {
    expect(detectContentType("WIFI:T:WPA;S:Network;P:pass;;")).toBe("wifi");
    expect(detectContentType("wifi:T:WPA;S:Network;P:pass;;")).toBe("wifi");
  });

  it("should detect email content", () => {
    expect(detectContentType("mailto:test@example.com")).toBe("email");
    expect(detectContentType("MAILTO:test@example.com")).toBe("email");
  });

  it("should detect phone content", () => {
    expect(detectContentType("tel:+15551234567")).toBe("phone");
    expect(detectContentType("TEL:5551234567")).toBe("phone");
  });

  it("should detect SMS content", () => {
    expect(detectContentType("sms:+15551234567")).toBe("sms");
    expect(detectContentType("smsto:+15551234567")).toBe("sms");
  });

  it("should detect URL content", () => {
    expect(detectContentType("https://example.com")).toBe("url");
    expect(detectContentType("http://example.com")).toBe("url");
    expect(detectContentType("www.example.com")).toBe("url");
  });

  it("should default to text for unknown content", () => {
    expect(detectContentType("Hello World")).toBe("text");
    expect(detectContentType("Some random text")).toBe("text");
  });
});

describe("parseWiFiData", () => {
  it("should return null for non-WiFi data", () => {
    expect(parseWiFiData("Hello World")).toBeNull();
    expect(parseWiFiData("https://example.com")).toBeNull();
  });

  it("should parse complete WiFi data", () => {
    const result = parseWiFiData(
      "WIFI:T:WPA;S:MyNetwork;P:secret123;H:false;;"
    );
    expect(result).toEqual({
      ssid: "MyNetwork",
      password: "secret123",
      encryption: "WPA",
      hidden: false,
    });
  });

  it("should parse WiFi with hidden network", () => {
    const result = parseWiFiData("WIFI:T:WPA;S:Hidden;P:pass;H:true;;");
    expect(result).toEqual({
      ssid: "Hidden",
      password: "pass",
      encryption: "WPA",
      hidden: true,
    });
  });

  it("should parse WiFi with no password", () => {
    const result = parseWiFiData("WIFI:T:nopass;S:Open;P:;H:false;;");
    expect(result).toEqual({
      ssid: "Open",
      password: "",
      encryption: "nopass",
      hidden: false,
    });
  });

  it("should handle missing parameters with defaults", () => {
    const result = parseWiFiData("WIFI:S:JustSSID;;");
    expect(result).toEqual({
      ssid: "JustSSID",
      password: "",
      encryption: "WPA", // defaults to WPA when not specified
      hidden: false,
    });
  });
});

describe("isValidHexColor", () => {
  it("should validate correct hex colors", () => {
    expect(isValidHexColor("#000000")).toBe(true);
    expect(isValidHexColor("#ffffff")).toBe(true);
    expect(isValidHexColor("#FFFFFF")).toBe(true);
    expect(isValidHexColor("#123abc")).toBe(true);
    expect(isValidHexColor("#ABC123")).toBe(true);
  });

  it("should reject invalid hex colors", () => {
    expect(isValidHexColor("000000")).toBe(false);
    expect(isValidHexColor("#fff")).toBe(false);
    expect(isValidHexColor("#ggghhh")).toBe(false);
    expect(isValidHexColor("#12345")).toBe(false);
    expect(isValidHexColor("#1234567")).toBe(false);
    expect(isValidHexColor("rgb(0,0,0)")).toBe(false);
  });
});

describe("DEFAULT_OPTIONS", () => {
  it("should have sensible defaults", () => {
    expect(DEFAULT_OPTIONS.errorCorrectionLevel).toBe("M");
    expect(DEFAULT_OPTIONS.width).toBe(256);
    expect(DEFAULT_OPTIONS.quietZone).toBe(10);
    expect(DEFAULT_OPTIONS.foreground).toBe("#000000");
    expect(DEFAULT_OPTIONS.background).toBe("#ffffff");
  });

  it("should have styling defaults", () => {
    expect(DEFAULT_OPTIONS.dotScale).toBe(1.0);
    expect(DEFAULT_OPTIONS.positionOuterColor).toBe("");
    expect(DEFAULT_OPTIONS.positionInnerColor).toBe("");
    expect(DEFAULT_OPTIONS.logoUrl).toBeNull();
    expect(DEFAULT_OPTIONS.logoWidth).toBe(60);
    expect(DEFAULT_OPTIONS.logoHeight).toBe(60);
    expect(DEFAULT_OPTIONS.logoBackgroundTransparent).toBe(true);
  });
});

describe("ERROR_CORRECTION_LABELS", () => {
  it("should have all error correction levels", () => {
    expect(ERROR_CORRECTION_LABELS.L).toBe("Low (7%)");
    expect(ERROR_CORRECTION_LABELS.M).toBe("Medium (15%)");
    expect(ERROR_CORRECTION_LABELS.Q).toBe("Quartile (25%)");
    expect(ERROR_CORRECTION_LABELS.H).toBe("High (30%)");
  });
});

describe("CONTENT_TYPE_LABELS", () => {
  it("should have all content types", () => {
    const types: QRContentType[] = [
      "text",
      "url",
      "wifi",
      "email",
      "phone",
      "sms",
    ];
    for (const type of types) {
      expect(CONTENT_TYPE_LABELS[type]).toBeDefined();
      expect(typeof CONTENT_TYPE_LABELS[type]).toBe("string");
    }
  });

  it("should have readable labels", () => {
    expect(CONTENT_TYPE_LABELS.text).toBe("Plain Text");
    expect(CONTENT_TYPE_LABELS.url).toBe("URL");
    expect(CONTENT_TYPE_LABELS.wifi).toBe("WiFi");
    expect(CONTENT_TYPE_LABELS.email).toBe("Email");
    expect(CONTENT_TYPE_LABELS.phone).toBe("Phone");
    expect(CONTENT_TYPE_LABELS.sms).toBe("SMS");
  });
});

describe("DOT_SCALE_OPTIONS", () => {
  it("should have multiple dot scale options", () => {
    expect(DOT_SCALE_OPTIONS.length).toBeGreaterThan(0);
    expect(DOT_SCALE_OPTIONS.some((opt) => opt.value === 1.0)).toBe(true);
    expect(DOT_SCALE_OPTIONS.some((opt) => opt.value === 0.7)).toBe(true);
  });

  it("should have labels for all options", () => {
    for (const opt of DOT_SCALE_OPTIONS) {
      expect(opt.label).toBeDefined();
      expect(opt.value).toBeDefined();
      expect(opt.value).toBeGreaterThan(0);
      expect(opt.value).toBeLessThanOrEqual(1);
    }
  });
});

describe("COLOR_PRESETS", () => {
  it("should have multiple color presets", () => {
    expect(COLOR_PRESETS.length).toBeGreaterThan(0);
  });

  it("should have valid hex colors for all presets", () => {
    for (const preset of COLOR_PRESETS) {
      expect(preset.name).toBeDefined();
      expect(isValidHexColor(preset.foreground)).toBe(true);
      expect(isValidHexColor(preset.background)).toBe(true);
      expect(isValidHexColor(preset.positionOuterColor)).toBe(true);
      expect(isValidHexColor(preset.positionInnerColor)).toBe(true);
    }
  });

  it("should include classic black and white preset", () => {
    const classic = COLOR_PRESETS.find((p) => p.name === "Classic");
    expect(classic).toBeDefined();
    expect(classic?.foreground).toBe("#000000");
    expect(classic?.background).toBe("#ffffff");
  });
});
