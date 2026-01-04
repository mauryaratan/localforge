export type EncodingType = "url" | "base64";

export type CssOutputFormat =
  | "dataUri"
  | "backgroundImage"
  | "backgroundImageFull"
  | "maskImage"
  | "listStyleImage";

export type ConversionResult = {
  isValid: boolean;
  error?: string;
  dataUri: string;
  css: Record<CssOutputFormat, string>;
  originalSize: number;
  encodedSize: number;
};

/**
 * Ensures the SVG has the required xmlns attribute
 */
export const ensureXmlns = (svg: string): string => {
  if (!svg.includes("xmlns")) {
    return svg.replace(/<svg/i, "<svg xmlns='http://www.w3.org/2000/svg'");
  }
  return svg;
};

/**
 * Validates if the input is valid SVG markup
 */
export const validateSvg = (input: string): { isValid: boolean; error?: string } => {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { isValid: false, error: "Please enter SVG code" };
  }

  if (!trimmed.startsWith("<svg") && !trimmed.startsWith("<?xml")) {
    return { isValid: false, error: "Input must start with <svg or <?xml" };
  }

  if (!trimmed.includes("</svg>") && !trimmed.match(/<svg[^>]*\/>/)) {
    return { isValid: false, error: "SVG tag is not properly closed" };
  }

  // Try parsing as XML to catch malformed SVG
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, "image/svg+xml");
    const errorNode = doc.querySelector("parsererror");
    if (errorNode) {
      return { isValid: false, error: "Invalid SVG markup" };
    }
  } catch {
    return { isValid: false, error: "Failed to parse SVG" };
  }

  return { isValid: true };
};

/**
 * URL-encode SVG for use in CSS (modern approach, better compression)
 * This encoding is more efficient than base64 for SVG
 */
export const urlEncodeSvg = (svg: string): string => {
  const prepared = ensureXmlns(svg.trim());
  
  // Minimal encoding - only encode characters that are required
  // This produces smaller output than encodeURIComponent
  return prepared
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Base64 encode SVG for legacy browser support (IE9+)
 */
export const base64EncodeSvg = (svg: string): string => {
  const prepared = ensureXmlns(svg.trim());
  
  // Use btoa for base64 encoding, handling unicode
  try {
    return btoa(unescape(encodeURIComponent(prepared)));
  } catch {
    // Fallback for environments without btoa
    return "";
  }
};

/**
 * Create a data URI from SVG
 */
export const createDataUri = (svg: string, encoding: EncodingType): string => {
  if (encoding === "base64") {
    const encoded = base64EncodeSvg(svg);
    return `data:image/svg+xml;base64,${encoded}`;
  }
  
  const encoded = urlEncodeSvg(svg);
  return `data:image/svg+xml,${encoded}`;
};

/**
 * Generate CSS output in various formats
 */
export const generateCssOutput = (
  dataUri: string,
  format: CssOutputFormat
): string => {
  switch (format) {
    case "dataUri":
      return dataUri;
    case "backgroundImage":
      return `background-image: url("${dataUri}");`;
    case "backgroundImageFull":
      return `background-image: url("${dataUri}");\nbackground-repeat: no-repeat;\nbackground-position: center;\nbackground-size: contain;`;
    case "maskImage":
      return `mask-image: url("${dataUri}");\n-webkit-mask-image: url("${dataUri}");\nmask-size: contain;\n-webkit-mask-size: contain;\nmask-repeat: no-repeat;\n-webkit-mask-repeat: no-repeat;`;
    case "listStyleImage":
      return `list-style-image: url("${dataUri}");`;
    default:
      return dataUri;
  }
};

/**
 * Convert SVG to CSS with all output formats
 */
export const convertSvgToCss = (
  svg: string,
  encoding: EncodingType = "url"
): ConversionResult => {
  const validation = validateSvg(svg);
  
  if (!validation.isValid) {
    return {
      isValid: false,
      error: validation.error,
      dataUri: "",
      css: {
        dataUri: "",
        backgroundImage: "",
        backgroundImageFull: "",
        maskImage: "",
        listStyleImage: "",
      },
      originalSize: 0,
      encodedSize: 0,
    };
  }

  const dataUri = createDataUri(svg, encoding);
  const originalSize = new Blob([svg]).size;
  const encodedSize = new Blob([dataUri]).size;

  return {
    isValid: true,
    dataUri,
    css: {
      dataUri: generateCssOutput(dataUri, "dataUri"),
      backgroundImage: generateCssOutput(dataUri, "backgroundImage"),
      backgroundImageFull: generateCssOutput(dataUri, "backgroundImageFull"),
      maskImage: generateCssOutput(dataUri, "maskImage"),
      listStyleImage: generateCssOutput(dataUri, "listStyleImage"),
    },
    originalSize,
    encodedSize,
  };
};

/**
 * Decode a data URI back to SVG
 */
export const decodeSvgFromDataUri = (dataUri: string): string => {
  try {
    // Only process valid data URIs
    if (!dataUri.startsWith("data:image/svg+xml")) {
      return "";
    }

    if (dataUri.includes(";base64,")) {
      const base64 = dataUri.split(";base64,")[1];
      return decodeURIComponent(escape(atob(base64)));
    }
    
    const encoded = dataUri.replace(/^data:image\/svg\+xml,/, "");
    return decodeURIComponent(encoded.replace(/%3C/g, "<").replace(/%3E/g, ">").replace(/%23/g, "#").replace(/%7B/g, "{").replace(/%7D/g, "}").replace(/%25/g, "%"));
  } catch {
    return "";
  }
};

/**
 * Format bytes to human-readable size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  
  const units = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(i > 0 ? 2 : 0)} ${units[i]}`;
};

/**
 * Example SVGs for demonstration
 */
export const exampleSvgs = {
  circle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#6366f1" />
</svg>`,
  star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#f59e0b">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>`,
  arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 12h14M12 5l7 7-7 7"/>
</svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg>`,
  checkmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"/>
</svg>`,
};

export const exampleLabels: Record<keyof typeof exampleSvgs, string> = {
  circle: "Circle",
  star: "Star",
  arrow: "Arrow",
  heart: "Heart",
  checkmark: "Checkmark",
};
