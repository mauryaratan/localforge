// Logo Maker Library
// Provides utilities for creating customizable logos with icons, text, and backgrounds

export interface IconConfig {
  type: "icon" | "text" | "image";
  value: string; // Icon name, text content, or image data URL
  size: number; // Percentage of container (10-100)
  rotation: number; // Degrees (0-360)
  borderWidth: number; // Pixels (0-20)
  borderColor: string; // Hex color
  fillColor: string; // Hex color
  fillOpacity: number; // 0-100
}

export interface BackgroundConfig {
  type: "solid" | "gradient";
  color: string; // Hex color (for solid) or start color (for gradient)
  gradientEndColor?: string; // Hex color (for gradient)
  gradientAngle?: number; // Degrees (0-360)
  radius: number; // Percentage (0-50, where 50 = circle)
  padding: number; // Percentage (0-50)
  innerShadow: boolean;
  innerShadowIntensity: number; // 0-100
  innerShadowColor: string; // Hex color
}

export interface LogoConfig {
  canvasSize: number;
  icon: IconConfig;
  background: BackgroundConfig;
}

export const DEFAULT_ICON_CONFIG: IconConfig = {
  type: "icon",
  value: "star",
  size: 60,
  rotation: 0,
  borderWidth: 0,
  borderColor: "#000000",
  fillColor: "#ffffff",
  fillOpacity: 100,
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: "solid",
  color: "#6366f1",
  gradientEndColor: "#8b5cf6",
  gradientAngle: 135,
  radius: 20,
  padding: 15,
  innerShadow: false,
  innerShadowIntensity: 30,
  innerShadowColor: "#000000",
};

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  canvasSize: 512,
  icon: DEFAULT_ICON_CONFIG,
  background: DEFAULT_BACKGROUND_CONFIG,
};

// Available icon categories and icons
export const ICON_CATEGORIES = {
  shapes: [
    "circle",
    "square",
    "triangle",
    "hexagon",
    "star",
    "heart",
    "diamond",
  ],
  arrows: [
    "arrow-up",
    "arrow-right",
    "arrow-down",
    "arrow-left",
    "chevron-right",
    "chevron-up",
  ],
  tech: [
    "code",
    "terminal",
    "database",
    "cloud",
    "server",
    "cpu",
    "wifi",
    "bluetooth",
  ],
  ui: [
    "home",
    "settings",
    "user",
    "search",
    "menu",
    "plus",
    "minus",
    "check",
    "x",
  ],
  media: ["play", "pause", "music", "image", "video", "camera", "mic"],
  business: [
    "briefcase",
    "chart",
    "mail",
    "phone",
    "calendar",
    "clock",
    "bookmark",
  ],
  nature: ["sun", "moon", "leaf", "flower", "tree", "mountain", "drop"],
  social: ["message", "share", "bell", "globe", "link", "at-sign"],
} as const;

// Flatten all icons for easy access
export const ALL_ICONS = Object.values(ICON_CATEGORIES).flat();

// Color presets for quick selection
export const COLOR_PRESETS = [
  { name: "Indigo", background: "#6366f1", icon: "#ffffff" },
  { name: "Rose", background: "#f43f5e", icon: "#ffffff" },
  { name: "Emerald", background: "#10b981", icon: "#ffffff" },
  { name: "Amber", background: "#f59e0b", icon: "#000000" },
  { name: "Sky", background: "#0ea5e9", icon: "#ffffff" },
  { name: "Purple", background: "#a855f7", icon: "#ffffff" },
  { name: "Slate", background: "#475569", icon: "#ffffff" },
  { name: "Black", background: "#000000", icon: "#ffffff" },
  { name: "White", background: "#ffffff", icon: "#000000" },
  { name: "Orange", background: "#f97316", icon: "#ffffff" },
  { name: "Teal", background: "#14b8a6", icon: "#ffffff" },
  { name: "Pink", background: "#ec4899", icon: "#ffffff" },
];

// Gradient presets
export const GRADIENT_PRESETS = [
  { name: "Purple Dream", start: "#667eea", end: "#764ba2", angle: 135 },
  { name: "Sunset", start: "#f093fb", end: "#f5576c", angle: 135 },
  { name: "Ocean", start: "#4facfe", end: "#00f2fe", angle: 135 },
  { name: "Forest", start: "#11998e", end: "#38ef7d", angle: 135 },
  { name: "Fire", start: "#f12711", end: "#f5af19", angle: 135 },
  { name: "Night", start: "#0f0c29", end: "#302b63", angle: 135 },
  { name: "Mint", start: "#00b09b", end: "#96c93d", angle: 135 },
  { name: "Berry", start: "#8e2de2", end: "#4a00e0", angle: 135 },
];

// Export sizes
export const EXPORT_SIZES = [
  { label: "16×16", value: 16 },
  { label: "32×32", value: 32 },
  { label: "64×64", value: 64 },
  { label: "128×128", value: 128 },
  { label: "256×256", value: 256 },
  { label: "512×512", value: 512 },
  { label: "1024×1024", value: 1024 },
];

// Icon SVG paths - simplified geometric icons
export const ICON_PATHS: Record<string, string> = {
  // Shapes
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  circle: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z",
  square: "M3 3h18v18H3V3z",
  triangle: "M12 2L2 22h20L12 2z",
  hexagon:
    "M21 16.5c0 .38-.21.71-.53.88l-7.94 4.41c-.3.17-.65.17-.95 0l-7.94-4.41A1 1 0 013 16.5v-9c0-.38.21-.71.53-.88l7.94-4.41c.3-.17.65-.17.95 0l7.94 4.41c.32.17.53.5.53.88v9z",
  diamond: "M12 2L2 12l10 10 10-10L12 2z",

  // Arrows
  "arrow-up": "M12 19V5m0 0l-7 7m7-7l7 7",
  "arrow-right": "M5 12h14m0 0l-7-7m7 7l-7 7",
  "arrow-down": "M12 5v14m0 0l7-7m-7 7l-7-7",
  "arrow-left": "M19 12H5m0 0l7 7m-7-7l7-7",
  "chevron-right": "M9 18l6-6-6-6",
  "chevron-up": "M18 15l-6-6-6 6",

  // Tech
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  terminal: "M4 17l6-6-6-6M12 19h8",
  database:
    "M12 3c4.97 0 9 1.79 9 4s-4.03 4-9 4-9-1.79-9-4 4.03-4 9-4zM3 7v5c0 2.21 4.03 4 9 4s9-1.79 9-4V7M3 12v5c0 2.21 4.03 4 9 4s9-1.79 9-4v-5",
  cloud: "M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z",
  server: "M2 4h20v6H2V4zm0 10h20v6H2v-6zm4-6h.01M6 18h.01",
  cpu: "M18 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3",
  wifi: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  bluetooth: "M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11",

  // UI
  home: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  settings:
    "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  menu: "M3 12h18M3 6h18M3 18h18",
  plus: "M12 5v14m-7-7h14",
  minus: "M5 12h14",
  check: "M20 6L9 17l-5-5",
  x: "M18 6L6 18M6 6l12 12",

  // Media
  play: "M5 3l14 9-14 9V3z",
  pause: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
  music:
    "M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z",
  image:
    "M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm.5 11l5-7 5 7H9z",
  video:
    "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 00-2 2v10a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2z",
  camera:
    "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",

  // Business
  briefcase:
    "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16",
  chart: "M18 20V10M12 20V4M6 20v-6",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.574 2.81.7A2 2 0 0122 16.92z",
  calendar:
    "M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18",
  clock:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",

  // Nature
  sun: "M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  leaf: "M11 20A7 7 0 019.8 6.4C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
  flower:
    "M12 7a5 5 0 100-10 5 5 0 000 10zM12 22v-5M12 7a5 5 0 00-3 9M12 7a5 5 0 013 9M7 14H3M21 14h-4",
  tree: "M12 22v-6M17 8l-5-6-5 6h3v4h4V8h3z",
  mountain: "M8 21l8.5-11L20 15M2 21h20M14 5l7 14H3l7-14z",
  drop: "M12 2.69l5.66 5.66a8 8 0 11-11.31 0z",

  // Social
  message: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  globe:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  "at-sign":
    "M16 12a4 4 0 10-8 0 4 4 0 008 0zm5 0v1.5a2.5 2.5 0 01-5 0V12a9 9 0 10-3.5 7.13",
};

/**
 * Generates SVG string for the logo
 */
export const generateLogoSVG = (config: LogoConfig): string => {
  const { canvasSize, icon, background } = config;
  const padding = (background.padding / 100) * canvasSize;
  const borderRadius = (background.radius / 100) * (canvasSize / 2);

  // Calculate inner area dimensions
  const innerSize = canvasSize - padding * 2;
  const iconSize = (icon.size / 100) * innerSize;
  const iconOffset = (canvasSize - iconSize) / 2;

  // Build background gradient if needed
  let backgroundFill = background.color;
  let gradientDef = "";

  if (background.type === "gradient" && background.gradientEndColor) {
    const gradientId = "logoGradient";
    const angle = background.gradientAngle || 135;
    // Convert angle to x1,y1,x2,y2
    const angleRad = (angle * Math.PI) / 180;
    const x1 = 50 - Math.cos(angleRad) * 50;
    const y1 = 50 - Math.sin(angleRad) * 50;
    const x2 = 50 + Math.cos(angleRad) * 50;
    const y2 = 50 + Math.sin(angleRad) * 50;

    gradientDef = `
      <linearGradient id="${gradientId}" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" style="stop-color:${background.color}"/>
        <stop offset="100%" style="stop-color:${background.gradientEndColor}"/>
      </linearGradient>
    `;
    backgroundFill = `url(#${gradientId})`;
  }

  // Inner shadow using vignette-style radial gradient overlay
  let innerShadowElement = "";
  let innerShadowDef = "";

  if (background.innerShadow) {
    const intensity = background.innerShadowIntensity / 100;
    const shadowColor = background.innerShadowColor || "#000000";
    const shadowOpacity = 0.15 + intensity * 0.35; // 0.15-0.5 opacity

    innerShadowDef = `
    <radialGradient id="innerShadowGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
      <stop offset="60%" stop-color="${shadowColor}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${shadowColor}" stop-opacity="${shadowOpacity}"/>
    </radialGradient>
    `;

    innerShadowElement = `
  <rect 
    x="0" 
    y="0" 
    width="${canvasSize}" 
    height="${canvasSize}" 
    rx="${borderRadius}" 
    ry="${borderRadius}" 
    fill="url(#innerShadowGrad)"
  />`;
  }

  // Build icon element
  let iconElement = "";
  const iconCenterX = canvasSize / 2;
  const iconCenterY = canvasSize / 2;
  const iconFillColor = icon.fillColor;
  const iconOpacity = icon.fillOpacity / 100;
  const iconStroke =
    icon.borderWidth > 0
      ? `stroke="${icon.borderColor}" stroke-width="${icon.borderWidth}"`
      : "";

  if (icon.type === "icon" && ICON_PATHS[icon.value]) {
    const path = ICON_PATHS[icon.value];
    const scale = iconSize / 24; // Icons are designed for 24x24 viewBox
    iconElement = `
      <g transform="translate(${iconCenterX}, ${iconCenterY}) rotate(${icon.rotation}) translate(${-iconCenterX}, ${-iconCenterY})">
        <g transform="translate(${iconOffset}, ${iconOffset}) scale(${scale})">
          <path d="${path}" fill="${iconFillColor}" fill-opacity="${iconOpacity}" ${iconStroke} stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
    `;
  } else if (icon.type === "text") {
    const fontSize = iconSize * 0.8;
    iconElement = `
      <g transform="translate(${iconCenterX}, ${iconCenterY}) rotate(${icon.rotation})">
        <text 
          x="0" 
          y="0" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="${iconFillColor}" 
          fill-opacity="${iconOpacity}" 
          text-anchor="middle" 
          dominant-baseline="central"
          ${iconStroke}
        >${escapeXml(icon.value)}</text>
      </g>
    `;
  } else if (icon.type === "image") {
    iconElement = `
      <g transform="translate(${iconCenterX}, ${iconCenterY}) rotate(${icon.rotation}) translate(${-iconCenterX}, ${-iconCenterY})">
        <image 
          href="${icon.value}" 
          x="${iconOffset}" 
          y="${iconOffset}" 
          width="${iconSize}" 
          height="${iconSize}"
          opacity="${iconOpacity}"
        />
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
  <defs>${gradientDef}${innerShadowDef}</defs>
  <rect 
    x="0" 
    y="0" 
    width="${canvasSize}" 
    height="${canvasSize}" 
    rx="${borderRadius}" 
    ry="${borderRadius}" 
    fill="${backgroundFill}"
  />${innerShadowElement}
  ${iconElement}
</svg>`;
};

/**
 * Escape XML special characters
 */
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Converts SVG to PNG data URL at specified size
 */
export const svgToPng = async (
  svgString: string,
  outputSize: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, outputSize, outputSize);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };

    img.src = url;
  });
};

/**
 * Downloads a file from a data URL
 */
export const downloadFile = (dataUrl: string, filename: string): void => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Downloads SVG file
 */
export const downloadSVG = (svgString: string, filename: string): void => {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  downloadFile(url, filename);
  URL.revokeObjectURL(url);
};

/**
 * Downloads PNG file at specified size
 */
export const downloadPNG = async (
  svgString: string,
  size: number,
  filename: string
): Promise<void> => {
  const pngDataUrl = await svgToPng(svgString, size);
  downloadFile(pngDataUrl, filename);
};

/**
 * Validates hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

/**
 * Converts image file to data URL
 */
export const imageToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Checks if file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/gif",
    "image/webp",
  ];
  return validTypes.includes(file.type);
};

/**
 * Local storage key for logo maker settings
 */
export const STORAGE_KEY = "devtools:logo-maker:config";

/**
 * Save config to localStorage (excludes image data URLs to save space)
 */
export const saveConfig = (config: LogoConfig): void => {
  try {
    // Don't store image data URLs in localStorage (they're too large)
    const configToSave: LogoConfig = {
      ...config,
      icon: {
        ...config.icon,
        // If it's an image type with a data URL, reset to default icon
        ...(config.icon.type === "image" &&
        config.icon.value.startsWith("data:")
          ? { type: "icon" as const, value: "star" }
          : {}),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Load config from localStorage
 */
export const loadConfig = (): LogoConfig | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as LogoConfig;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
};
