export type RGB = { r: number; g: number; b: number };
export type RGBA = RGB & { a: number };
export type HSL = { h: number; s: number; l: number };
export type HSLA = HSL & { a: number };
export type HSV = { h: number; s: number; v: number };
export type CMYK = { c: number; m: number; y: number; k: number };

export type ColorFormats = {
  hex: string;
  hex8: string;
  rgb: RGB;
  rgba: RGBA;
  hsl: HSL;
  hsla: HSLA;
  hsv: HSV;
  cmyk: CMYK;
};

export type ParsedColor = {
  isValid: boolean;
  error?: string;
  formats: ColorFormats | null;
};

// Clamp value between min and max
const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

// Round to specified decimal places
const round = (value: number, decimals = 2): number =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

// Parse HEX color
const parseHex = (hex: string): RGBA | null => {
  const cleanHex = hex.replace("#", "");

  if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) return null;

  let r: number;
  let g: number;
  let b: number;
  let a = 1;

  if (cleanHex.length === 3) {
    r = Number.parseInt(cleanHex[0] + cleanHex[0], 16);
    g = Number.parseInt(cleanHex[1] + cleanHex[1], 16);
    b = Number.parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 4) {
    r = Number.parseInt(cleanHex[0] + cleanHex[0], 16);
    g = Number.parseInt(cleanHex[1] + cleanHex[1], 16);
    b = Number.parseInt(cleanHex[2] + cleanHex[2], 16);
    a = Number.parseInt(cleanHex[3] + cleanHex[3], 16) / 255;
  } else if (cleanHex.length === 6) {
    r = Number.parseInt(cleanHex.slice(0, 2), 16);
    g = Number.parseInt(cleanHex.slice(2, 4), 16);
    b = Number.parseInt(cleanHex.slice(4, 6), 16);
  } else if (cleanHex.length === 8) {
    r = Number.parseInt(cleanHex.slice(0, 2), 16);
    g = Number.parseInt(cleanHex.slice(2, 4), 16);
    b = Number.parseInt(cleanHex.slice(4, 6), 16);
    a = Number.parseInt(cleanHex.slice(6, 8), 16) / 255;
  } else {
    return null;
  }

  return { r, g, b, a: round(a) };
};

// Parse RGB/RGBA color
const parseRgb = (input: string): RGBA | null => {
  const rgbaMatch = input.match(
    /rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+))?\s*\)/i
  );

  if (!rgbaMatch) return null;

  const r = clamp(Number.parseInt(rgbaMatch[1], 10), 0, 255);
  const g = clamp(Number.parseInt(rgbaMatch[2], 10), 0, 255);
  const b = clamp(Number.parseInt(rgbaMatch[3], 10), 0, 255);
  const a = rgbaMatch[4] ? clamp(Number.parseFloat(rgbaMatch[4]), 0, 1) : 1;

  return { r, g, b, a: round(a) };
};

// Parse HSL/HSLA color
const parseHsl = (input: string): RGBA | null => {
  const hslaMatch = input.match(
    /hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/i
  );

  if (!hslaMatch) return null;

  const h = Number.parseFloat(hslaMatch[1]) % 360;
  const s = clamp(Number.parseFloat(hslaMatch[2]), 0, 100) / 100;
  const l = clamp(Number.parseFloat(hslaMatch[3]), 0, 100) / 100;
  const a = hslaMatch[4] ? clamp(Number.parseFloat(hslaMatch[4]), 0, 1) : 1;

  return { ...hslToRgb({ h, s: s * 100, l: l * 100 }), a: round(a) };
};

// RGB to HSL conversion
export const rgbToHsl = (rgb: RGB): HSL => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: round(h * 360), s: round(s * 100), l: round(l * 100) };
};

// HSL to RGB conversion
export const hslToRgb = (hsl: HSL): RGB => {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const val = Math.round(l * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let adjustedT = t;
    if (adjustedT < 0) adjustedT += 1;
    if (adjustedT > 1) adjustedT -= 1;
    if (adjustedT < 1 / 6) return p + (q - p) * 6 * adjustedT;
    if (adjustedT < 1 / 2) return q;
    if (adjustedT < 2 / 3) return p + (q - p) * (2 / 3 - adjustedT) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
};

// RGB to HSV conversion
export const rgbToHsv = (rgb: RGB): HSV => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const v = max;

  const s = max === 0 ? 0 : d / max;

  if (max === min) {
    return { h: 0, s: round(s * 100), v: round(v * 100) };
  }

  let h = 0;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return { h: round(h * 360), s: round(s * 100), v: round(v * 100) };
};

// HSV to RGB conversion
export const hsvToRgb = (hsv: HSV): RGB => {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r: number;
  let g: number;
  let b: number;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

// RGB to CMYK conversion
export const rgbToCmyk = (rgb: RGB): CMYK => {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return {
    c: round(((1 - r - k) / (1 - k)) * 100),
    m: round(((1 - g - k) / (1 - k)) * 100),
    y: round(((1 - b - k) / (1 - k)) * 100),
    k: round(k * 100),
  };
};

// CMYK to RGB conversion
export const cmykToRgb = (cmyk: CMYK): RGB => {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  };
};

// RGB to HEX conversion
export const rgbToHex = (rgb: RGB): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};

// RGBA to HEX8 conversion
export const rgbaToHex8 = (rgba: RGBA): string => {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  const alphaHex = Math.round(rgba.a * 255);
  return `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}${toHex(alphaHex)}`;
};

// Format output strings
export const formatRgb = (rgb: RGB): string =>
  `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

export const formatRgba = (rgba: RGBA): string =>
  `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

export const formatHsl = (hsl: HSL): string =>
  `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

export const formatHsla = (hsla: HSLA): string =>
  `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;

export const formatHsv = (hsv: HSV): string =>
  `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;

export const formatCmyk = (cmyk: CMYK): string =>
  `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

// Main parse function - detects format and converts
export const parseColor = (input: string): ParsedColor => {
  const trimmed = input.trim();

  if (!trimmed) {
    return { isValid: false, error: "Please enter a color", formats: null };
  }

  let rgba: RGBA | null = null;

  // Try parsing as HEX
  if (trimmed.startsWith("#") || /^[0-9A-Fa-f]{3,8}$/.test(trimmed)) {
    rgba = parseHex(trimmed.startsWith("#") ? trimmed : `#${trimmed}`);
  }

  // Try parsing as RGB/RGBA
  if (!rgba && /^rgba?\s*\(/i.test(trimmed)) {
    rgba = parseRgb(trimmed);
  }

  // Try parsing as HSL/HSLA
  if (!rgba && /^hsla?\s*\(/i.test(trimmed)) {
    rgba = parseHsl(trimmed);
  }

  if (!rgba) {
    return { isValid: false, error: "Invalid color format", formats: null };
  }

  const rgb: RGB = { r: rgba.r, g: rgba.g, b: rgba.b };
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  const cmyk = rgbToCmyk(rgb);

  return {
    isValid: true,
    formats: {
      hex: rgbToHex(rgb),
      hex8: rgbaToHex8(rgba),
      rgb,
      rgba,
      hsl,
      hsla: { ...hsl, a: rgba.a },
      hsv,
      cmyk,
    },
  };
};

// Calculate relative luminance for contrast calculations
export const getLuminance = (rgb: RGB): number => {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Calculate contrast ratio between two colors
export const getContrastRatio = (rgb1: RGB, rgb2: RGB): number => {
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return round((lighter + 0.05) / (darker + 0.05), 2);
};

// Get WCAG compliance level
export const getWcagLevel = (
  ratio: number
): { aa: boolean; aaLarge: boolean; aaa: boolean; aaaLarge: boolean } => ({
  aa: ratio >= 4.5,
  aaLarge: ratio >= 3,
  aaa: ratio >= 7,
  aaaLarge: ratio >= 4.5,
});

// Generate complementary color
export const getComplementary = (hsl: HSL): HSL => ({
  h: (hsl.h + 180) % 360,
  s: hsl.s,
  l: hsl.l,
});

// Generate triadic colors
export const getTriadic = (hsl: HSL): [HSL, HSL] => [
  { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l },
  { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l },
];

// Generate analogous colors
export const getAnalogous = (hsl: HSL): [HSL, HSL] => [
  { h: (hsl.h + 30 + 360) % 360, s: hsl.s, l: hsl.l },
  { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l },
];

// Generate split-complementary colors
export const getSplitComplementary = (hsl: HSL): [HSL, HSL] => [
  { h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l },
  { h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l },
];

// Example colors for quick access
export const exampleColors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "White", value: "#ffffff" },
  { name: "Gray", value: "#6b7280" },
  { name: "Black", value: "#000000" },
  { name: "Tailwind Slate", value: "#64748b" },
];
