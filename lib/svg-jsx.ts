export type OutputFormat = "jsx" | "component" | "componentTs";

export type ConversionOptions = {
  outputFormat: OutputFormat;
  componentName: string;
  memo: boolean;
  spreadProps: boolean;
  singleQuotes: boolean;
  cleanupIds: boolean;
};

export type ConversionResult = {
  isValid: boolean;
  error?: string;
  output: string;
  originalSize: number;
  outputSize: number;
};

const defaultOptions: ConversionOptions = {
  outputFormat: "jsx",
  componentName: "SvgIcon",
  memo: false,
  spreadProps: true,
  singleQuotes: false,
  cleanupIds: false,
};

/**
 * Map of SVG attributes to their JSX equivalents
 */
const attributeMap: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  "xlink:href": "xlinkHref",
  "xlink:title": "xlinkTitle",
  "xlink:show": "xlinkShow",
  "xlink:role": "xlinkRole",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:actuate": "xlinkActuate",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
  "xml:base": "xmlBase",
  // Common SVG attributes that need camelCase
  "accent-height": "accentHeight",
  "alignment-baseline": "alignmentBaseline",
  "arabic-form": "arabicForm",
  "baseline-shift": "baselineShift",
  "cap-height": "capHeight",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "color-profile": "colorProfile",
  "color-rendering": "colorRendering",
  "dominant-baseline": "dominantBaseline",
  "enable-background": "enableBackground",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-size-adjust": "fontSizeAdjust",
  "font-stretch": "fontStretch",
  "font-style": "fontStyle",
  "font-variant": "fontVariant",
  "font-weight": "fontWeight",
  "glyph-name": "glyphName",
  "glyph-orientation-horizontal": "glyphOrientationHorizontal",
  "glyph-orientation-vertical": "glyphOrientationVertical",
  "horiz-adv-x": "horizAdvX",
  "horiz-origin-x": "horizOriginX",
  "image-rendering": "imageRendering",
  "letter-spacing": "letterSpacing",
  "lighting-color": "lightingColor",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "overline-position": "overlinePosition",
  "overline-thickness": "overlineThickness",
  "paint-order": "paintOrder",
  "panose-1": "panose1",
  "pointer-events": "pointerEvents",
  "rendering-intent": "renderingIntent",
  "shape-rendering": "shapeRendering",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "strikethrough-position": "strikethroughPosition",
  "strikethrough-thickness": "strikethroughThickness",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "text-rendering": "textRendering",
  "transform-origin": "transformOrigin",
  "underline-position": "underlinePosition",
  "underline-thickness": "underlineThickness",
  "unicode-bidi": "unicodeBidi",
  "unicode-range": "unicodeRange",
  "units-per-em": "unitsPerEm",
  "v-alphabetic": "vAlphabetic",
  "v-hanging": "vHanging",
  "v-ideographic": "vIdeographic",
  "v-mathematical": "vMathematical",
  "vert-adv-y": "vertAdvY",
  "vert-origin-x": "vertOriginX",
  "vert-origin-y": "vertOriginY",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
  "x-height": "xHeight",
  // aria attributes stay as-is (they are valid in JSX)
  // data-* attributes stay as-is
};

/**
 * Converts a hyphenated string to camelCase
 */
export const toCamelCase = (str: string): string => {
  // Don't convert aria-* and data-* attributes
  if (str.startsWith("aria-") || str.startsWith("data-")) {
    return str;
  }

  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts an attribute name to its JSX equivalent
 */
export const convertAttributeName = (attr: string): string => {
  // Check if there's a direct mapping
  if (attributeMap[attr]) {
    return attributeMap[attr];
  }

  // Convert hyphenated attributes to camelCase
  if (attr.includes("-")) {
    return toCamelCase(attr);
  }

  return attr;
};

/**
 * Parses inline CSS style string to JSX style object
 */
export const parseStyleToJsx = (
  styleStr: string,
  singleQuotes: boolean
): string => {
  if (!styleStr.trim()) return "{}";

  const quote = singleQuotes ? "'" : '"';
  const styles = styleStr.split(";").filter((s) => s.trim());
  const jsxStyles: string[] = [];

  for (const style of styles) {
    const colonIndex = style.indexOf(":");
    if (colonIndex === -1) continue;

    const prop = style.slice(0, colonIndex).trim();
    const value = style.slice(colonIndex + 1).trim();

    if (!(prop && value)) continue;

    // Convert CSS property to camelCase
    const jsxProp = toCamelCase(prop);

    // Check if value is numeric (for unitless values)
    const numericValue = Number.parseFloat(value);
    const isNumeric =
      !Number.isNaN(numericValue) && String(numericValue) === value;

    if (isNumeric) {
      jsxStyles.push(`${jsxProp}: ${value}`);
    } else {
      jsxStyles.push(`${jsxProp}: ${quote}${value}${quote}`);
    }
  }

  return `{ ${jsxStyles.join(", ")} }`;
};

/**
 * Generates a unique ID prefix
 */
const generateIdPrefix = (): string => {
  return `svg-${Math.random().toString(36).slice(2, 8)}`;
};

/**
 * Validates if the input is valid SVG markup
 */
export const validateSvg = (
  input: string
): { isValid: boolean; error?: string } => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { isValid: false, error: "Please enter SVG code" };
  }

  if (!(trimmed.startsWith("<svg") || trimmed.startsWith("<?xml"))) {
    return { isValid: false, error: "Input must start with <svg or <?xml" };
  }

  if (!(trimmed.includes("</svg>") || trimmed.match(/<svg[^>]*\/>/))) {
    return { isValid: false, error: "SVG tag is not properly closed" };
  }

  // Try parsing as XML to catch malformed SVG
  try {
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const doc = parser.parseFromString(trimmed, "image/svg+xml");
      const errorNode = doc.querySelector("parsererror");
      if (errorNode) {
        return { isValid: false, error: "Invalid SVG markup" };
      }
    }
  } catch {
    return { isValid: false, error: "Failed to parse SVG" };
  }

  return { isValid: true };
};

/**
 * Converts SVG attribute string to JSX attributes
 */
export const convertAttributes = (
  attributesStr: string,
  options: ConversionOptions,
  idPrefix?: string
): string => {
  if (!attributesStr.trim()) return "";

  const quote = options.singleQuotes ? "'" : '"';
  const result: string[] = [];

  // Match attributes including those with complex values (like xmlns)
  const attrRegex =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(attributesStr)) !== null) {
    const [, attrName, doubleValue, singleValue] = match;
    const value = doubleValue ?? singleValue ?? "";

    // Convert attribute name
    const jsxAttrName = convertAttributeName(attrName);

    // Skip xmlns:xlink if we're using xlinkHref
    if (attrName === "xmlns:xlink") {
      continue;
    }

    // Handle style attribute specially
    if (attrName === "style") {
      const jsxStyle = parseStyleToJsx(value, options.singleQuotes);
      result.push(`style={${jsxStyle}}`);
      continue;
    }

    // Handle id attribute with cleanup option
    if (attrName === "id" && options.cleanupIds && idPrefix) {
      result.push(`${jsxAttrName}=${quote}${idPrefix}-${value}${quote}`);
      continue;
    }

    // Handle url() references in attributes (for gradients, clips, etc.)
    if (options.cleanupIds && idPrefix && value.includes("url(#")) {
      const updatedValue = value.replace(
        /url\(#([^)]+)\)/g,
        `url(#${idPrefix}-$1)`
      );
      result.push(`${jsxAttrName}=${quote}${updatedValue}${quote}`);
      continue;
    }

    // Handle href referencing internal IDs
    if (
      options.cleanupIds &&
      idPrefix &&
      (attrName === "href" || attrName === "xlink:href") &&
      value.startsWith("#")
    ) {
      result.push(
        `${jsxAttrName}=${quote}#${idPrefix}-${value.slice(1)}${quote}`
      );
      continue;
    }

    // Boolean attributes (no value)
    if (value === "" && match[0] === attrName) {
      result.push(`${jsxAttrName}={true}`);
      continue;
    }

    result.push(`${jsxAttrName}=${quote}${value}${quote}`);
  }

  return result.join(" ");
};

/**
 * Converts SVG to JSX
 */
export const convertSvgToJsx = (
  svg: string,
  options: Partial<ConversionOptions> = {}
): ConversionResult => {
  const opts = { ...defaultOptions, ...options };
  const validation = validateSvg(svg);

  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      output: "",
      originalSize: 0,
      outputSize: 0,
    };
  }

  const originalSize = new Blob([svg]).size;
  let result = svg.trim();

  // Generate ID prefix if cleanup is enabled
  const idPrefix = opts.cleanupIds ? generateIdPrefix() : undefined;

  // Remove XML declaration
  result = result.replace(/<\?xml[^?]*\?>/gi, "");

  // Remove DOCTYPE
  result = result.replace(/<!DOCTYPE[^>]*>/gi, "");

  // Remove comments
  result = result.replace(/<!--[\s\S]*?-->/g, "");

  // Remove CDATA (but keep content)
  result = result.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");

  // Process all tags with attributes
  result = result.replace(
    /<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g,
    (match, tagName, attrs, selfClosing) => {
      const convertedAttrs = convertAttributes(attrs, opts, idPrefix);
      const space = convertedAttrs ? " " : "";
      return `<${tagName}${space}${convertedAttrs}${selfClosing ? " /" : ""}>`;
    }
  );

  // Add spread props to root SVG element if enabled
  if (opts.spreadProps) {
    result = result.replace(/^(<svg\s+[^>]*)(\/?>)/, "$1 {...props}$2");
  }

  // Format output based on selected format
  const quote = opts.singleQuotes ? "'" : '"';

  if (opts.outputFormat === "jsx") {
    // Just the JSX element
    const outputSize = new Blob([result]).size;
    return {
      isValid: true,
      output: result.trim(),
      originalSize,
      outputSize,
    };
  }

  // Component wrapper
  const componentName = opts.componentName || "SvgIcon";
  const propsType =
    opts.outputFormat === "componentTs"
      ? ": React.SVGProps<SVGSVGElement>"
      : "";
  const memoWrapper = opts.memo;

  let component: string;

  if (opts.outputFormat === "componentTs") {
    if (memoWrapper) {
      component = `import { memo } from ${quote}react${quote};

const ${componentName} = memo((props${propsType}) => (
  ${result.trim()}
));

${componentName}.displayName = ${quote}${componentName}${quote};

export default ${componentName};`;
    } else {
      component = `const ${componentName} = (props${propsType}) => (
  ${result.trim()}
);

export default ${componentName};`;
    }
  } else if (memoWrapper) {
    component = `import { memo } from ${quote}react${quote};

const ${componentName} = memo((props) => (
  ${result.trim()}
));

${componentName}.displayName = ${quote}${componentName}${quote};

export default ${componentName};`;
  } else {
    component = `const ${componentName} = (props) => (
  ${result.trim()}
);

export default ${componentName};`;
  }

  const outputSize = new Blob([component]).size;

  return {
    isValid: true,
    output: component,
    originalSize,
    outputSize,
  };
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / 1024 ** i;

  return `${size.toFixed(i > 0 ? 2 : 0)} ${units[i]}`;
};

/**
 * Example SVGs for demonstration
 */
export const exampleSvgs = {
  simple: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>`,
  withStyle: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <rect x="10" y="10" width="80" height="80" style="fill: #6366f1; stroke: #4f46e5; stroke-width: 2px;"/>
</svg>`,
  withClass: `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"/>
  <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
  <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"/>
</svg>`,
  withGradient: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#grad1)"/>
</svg>`,
  complex: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" color-interpolation-filters="sRGB">
  <defs>
    <clipPath id="clip0">
      <rect width="24" height="24" fill="white"/>
    </clipPath>
  </defs>
  <g clip-path="url(#clip0)">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill-opacity="0.1" fill="currentColor"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </g>
</svg>`,
};

export const exampleLabels: Record<keyof typeof exampleSvgs, string> = {
  simple: "Simple icon",
  withStyle: "With inline style",
  withClass: "With class attribute",
  withGradient: "With gradient",
  complex: "Complex with defs",
};
