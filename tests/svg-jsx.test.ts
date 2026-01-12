import { describe, expect, it } from "vitest";
import {
  convertAttributeName,
  convertAttributes,
  convertSvgToJsx,
  formatBytes,
  parseStyleToJsx,
  toCamelCase,
  validateSvg,
} from "@/lib/svg-jsx";

describe("toCamelCase", () => {
  it("should convert hyphenated strings to camelCase", () => {
    expect(toCamelCase("stroke-width")).toBe("strokeWidth");
    expect(toCamelCase("fill-opacity")).toBe("fillOpacity");
    expect(toCamelCase("stroke-linecap")).toBe("strokeLinecap");
  });

  it("should not convert aria-* attributes", () => {
    expect(toCamelCase("aria-label")).toBe("aria-label");
    expect(toCamelCase("aria-hidden")).toBe("aria-hidden");
  });

  it("should not convert data-* attributes", () => {
    expect(toCamelCase("data-testid")).toBe("data-testid");
    expect(toCamelCase("data-custom")).toBe("data-custom");
  });

  it("should return unchanged if no hyphens", () => {
    expect(toCamelCase("fill")).toBe("fill");
    expect(toCamelCase("viewBox")).toBe("viewBox");
  });
});

describe("convertAttributeName", () => {
  it("should convert class to className", () => {
    expect(convertAttributeName("class")).toBe("className");
  });

  it("should convert xlink:href to xlinkHref", () => {
    expect(convertAttributeName("xlink:href")).toBe("xlinkHref");
  });

  it("should convert hyphenated SVG attributes", () => {
    expect(convertAttributeName("stroke-width")).toBe("strokeWidth");
    expect(convertAttributeName("fill-rule")).toBe("fillRule");
    expect(convertAttributeName("clip-path")).toBe("clipPath");
    expect(convertAttributeName("color-interpolation-filters")).toBe(
      "colorInterpolationFilters"
    );
  });

  it("should return unchanged for standard attributes", () => {
    expect(convertAttributeName("fill")).toBe("fill");
    expect(convertAttributeName("viewBox")).toBe("viewBox");
    expect(convertAttributeName("xmlns")).toBe("xmlns");
  });
});

describe("parseStyleToJsx", () => {
  it("should convert inline style to JSX object with double quotes", () => {
    const result = parseStyleToJsx("fill: #6366f1; stroke: #4f46e5;", false);
    expect(result).toContain("fill:");
    expect(result).toContain('"#6366f1"');
  });

  it("should convert inline style to JSX object with single quotes", () => {
    const result = parseStyleToJsx("fill: #6366f1;", true);
    expect(result).toContain("'#6366f1'");
  });

  it("should handle numeric values without quotes", () => {
    const result = parseStyleToJsx("stroke-width: 2;", false);
    expect(result).toContain("strokeWidth: 2");
  });

  it("should convert CSS properties to camelCase", () => {
    const result = parseStyleToJsx(
      "stroke-width: 2px; fill-opacity: 0.5;",
      false
    );
    expect(result).toContain("strokeWidth:");
    expect(result).toContain("fillOpacity:");
  });

  it("should return empty object for empty style", () => {
    expect(parseStyleToJsx("", false)).toBe("{}");
    expect(parseStyleToJsx("   ", false)).toBe("{}");
  });
});

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

describe("convertAttributes", () => {
  const defaultOptions = {
    outputFormat: "jsx" as const,
    componentName: "SvgIcon",
    memo: false,
    spreadProps: true,
    singleQuotes: false,
    cleanupIds: false,
  };

  it("should convert hyphenated attributes to camelCase", () => {
    const result = convertAttributes(
      'stroke-width="2" fill-opacity="0.5"',
      defaultOptions
    );
    expect(result).toContain('strokeWidth="2"');
    expect(result).toContain('fillOpacity="0.5"');
  });

  it("should convert class to className", () => {
    const result = convertAttributes('class="icon"', defaultOptions);
    expect(result).toContain('className="icon"');
  });

  it("should handle style attribute", () => {
    const result = convertAttributes('style="fill: red;"', defaultOptions);
    expect(result).toContain("style={");
  });

  it("should use single quotes when option is set", () => {
    const result = convertAttributes('fill="red"', {
      ...defaultOptions,
      singleQuotes: true,
    });
    expect(result).toContain("fill='red'");
  });

  it("should skip xmlns:xlink", () => {
    const result = convertAttributes(
      'xmlns:xlink="http://www.w3.org/1999/xlink"',
      defaultOptions
    );
    expect(result).toBe("");
  });
});

describe("convertSvgToJsx", () => {
  const validSvg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10" /></svg>';

  it("should convert valid SVG successfully", () => {
    const result = convertSvgToJsx(validSvg);
    expect(result.isValid).toBe(true);
    expect(result.output).toBeTruthy();
  });

  it("should convert stroke-width to strokeWidth", () => {
    const result = convertSvgToJsx(validSvg);
    expect(result.output).toContain("strokeWidth=");
    expect(result.output).not.toContain("stroke-width");
  });

  it("should add spread props by default", () => {
    const result = convertSvgToJsx(validSvg);
    expect(result.output).toContain("{...props}");
  });

  it("should not add spread props when disabled", () => {
    const result = convertSvgToJsx(validSvg, { spreadProps: false });
    expect(result.output).not.toContain("{...props}");
  });

  it("should calculate original and output sizes", () => {
    const result = convertSvgToJsx(validSvg);
    expect(result.originalSize).toBeGreaterThan(0);
    expect(result.outputSize).toBeGreaterThan(0);
  });

  it("should return error for invalid SVG", () => {
    const result = convertSvgToJsx("invalid svg");
    expect(result.isValid).toBe(false);
    expect(result.error).toBeTruthy();
    expect(result.output).toBe("");
  });

  it("should remove XML declaration", () => {
    const svgWithXml = '<?xml version="1.0" encoding="UTF-8"?>' + validSvg;
    const result = convertSvgToJsx(svgWithXml);
    expect(result.output).not.toContain("<?xml");
  });

  it("should remove comments", () => {
    const svgWithComment =
      '<svg xmlns="http://www.w3.org/2000/svg"><!-- comment --><rect /></svg>';
    const result = convertSvgToJsx(svgWithComment);
    expect(result.output).not.toContain("<!-- comment -->");
  });

  it("should convert class to className", () => {
    const svgWithClass =
      '<svg xmlns="http://www.w3.org/2000/svg" class="icon"><rect /></svg>';
    const result = convertSvgToJsx(svgWithClass);
    expect(result.output).toContain("className=");
    expect(result.output).not.toContain('class="');
  });

  it("should generate React component wrapper", () => {
    const result = convertSvgToJsx(validSvg, { outputFormat: "component" });
    expect(result.output).toContain("const SvgIcon = (props) =>");
    expect(result.output).toContain("export default SvgIcon");
  });

  it("should use custom component name", () => {
    const result = convertSvgToJsx(validSvg, {
      outputFormat: "component",
      componentName: "MyIcon",
    });
    expect(result.output).toContain("const MyIcon = (props) =>");
    expect(result.output).toContain("export default MyIcon");
  });

  it("should generate TypeScript component", () => {
    const result = convertSvgToJsx(validSvg, { outputFormat: "componentTs" });
    expect(result.output).toContain("React.SVGProps<SVGSVGElement>");
  });

  it("should add React.memo wrapper when enabled", () => {
    const result = convertSvgToJsx(validSvg, {
      outputFormat: "component",
      memo: true,
    });
    expect(result.output).toContain("memo(");
    expect(result.output).toContain("import { memo }");
    expect(result.output).toContain(".displayName =");
  });

  it("should use single quotes when enabled", () => {
    const result = convertSvgToJsx(validSvg, {
      outputFormat: "component",
      singleQuotes: true,
    });
    // Check attribute quotes use single quotes
    expect(result.output).toContain("xmlns='");
    expect(result.output).toContain("strokeWidth='");
  });

  it("should convert inline style to JSX object", () => {
    const svgWithStyle =
      '<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill: red; stroke-width: 2px;" /></svg>';
    const result = convertSvgToJsx(svgWithStyle);
    expect(result.output).toContain("style={");
    expect(result.output).toContain("fill:");
    expect(result.output).toContain("strokeWidth:");
  });

  it("should convert xlink:href to xlinkHref", () => {
    const svgWithXlink =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#icon" /></svg>';
    const result = convertSvgToJsx(svgWithXlink);
    expect(result.output).toContain("xlinkHref=");
    expect(result.output).not.toContain("xlink:href=");
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
