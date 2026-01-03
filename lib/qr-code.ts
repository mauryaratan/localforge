/**
 * QR Code generation and reading utilities
 * Uses EasyQRCodeJS for advanced customization
 */

import jsQR from "jsqr";

// Error correction levels - higher = more redundancy, lower = smaller QR
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export const ERROR_CORRECTION_LABELS: Record<ErrorCorrectionLevel, string> = {
  L: "Low (7%)",
  M: "Medium (15%)",
  Q: "Quartile (25%)",
  H: "High (30%)",
};

// Content type presets for common QR code formats
export type QRContentType =
  | "text"
  | "url"
  | "wifi"
  | "email"
  | "phone"
  | "sms";

export const CONTENT_TYPE_LABELS: Record<QRContentType, string> = {
  text: "Plain Text",
  url: "URL",
  wifi: "WiFi",
  email: "Email",
  phone: "Phone",
  sms: "SMS",
};

// Dot scale options (0.1 to 1.0)
export type DotScale = number;

export const DOT_SCALE_OPTIONS: { value: DotScale; label: string }[] = [
  { value: 1.0, label: "Square (100%)" },
  { value: 0.9, label: "Rounded (90%)" },
  { value: 0.8, label: "Small (80%)" },
  { value: 0.7, label: "Dots (70%)" },
  { value: 0.6, label: "Mini (60%)" },
  { value: 0.5, label: "Tiny (50%)" },
];

export type QRGenerateOptions = {
  errorCorrectionLevel: ErrorCorrectionLevel;
  width: number;
  quietZone: number;
  foreground: string;
  background: string;
  // Advanced styling
  dotScale: DotScale;
  // Position pattern colors (corners)
  positionOuterColor: string;
  positionInnerColor: string;
  // Logo
  logoUrl: string | null;
  logoWidth: number;
  logoHeight: number;
  logoBackgroundTransparent: boolean;
};

export const DEFAULT_OPTIONS: QRGenerateOptions = {
  errorCorrectionLevel: "M",
  width: 256,
  quietZone: 10,
  foreground: "#000000",
  background: "#ffffff",
  // Advanced styling defaults
  dotScale: 1.0,
  positionOuterColor: "",
  positionInnerColor: "",
  // Logo defaults
  logoUrl: null,
  logoWidth: 60,
  logoHeight: 60,
  logoBackgroundTransparent: true,
};

export type QRGenerateResult = {
  success: boolean;
  dataUrl?: string;
  error?: string;
};

export type QRReadResult = {
  success: boolean;
  data?: string;
  contentType?: QRContentType;
  error?: string;
};

/**
 * Format content based on type for QR code encoding
 */
export const formatQRContent = (
  content: string,
  type: QRContentType,
  metadata?: {
    ssid?: string;
    password?: string;
    encryption?: "WPA" | "WEP" | "nopass";
    hidden?: boolean;
    subject?: string;
    body?: string;
  }
): string => {
  if (!content.trim()) return "";

  switch (type) {
    case "url":
      // Add https:// if no protocol specified
      if (!/^https?:\/\//i.test(content)) {
        return `https://${content}`;
      }
      return content;

    case "wifi":
      // WiFi QR format: WIFI:T:<encryption>;S:<ssid>;P:<password>;H:<hidden>;;
      const ssid = metadata?.ssid || content;
      const password = metadata?.password || "";
      const encryption = metadata?.encryption || "WPA";
      const hidden = metadata?.hidden ? "true" : "false";
      return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden};;`;

    case "email":
      // mailto: format
      const subject = metadata?.subject ? `?subject=${encodeURIComponent(metadata.subject)}` : "";
      const body = metadata?.body ? `${subject ? "&" : "?"}body=${encodeURIComponent(metadata.body)}` : "";
      return `mailto:${content}${subject}${body}`;

    case "phone":
      // tel: format - strip non-numeric except +
      const cleaned = content.replace(/[^\d+]/g, "");
      return `tel:${cleaned}`;

    case "sms":
      // sms: format
      const smsBody = metadata?.body ? `?body=${encodeURIComponent(metadata.body)}` : "";
      return `sms:${content.replace(/[^\d+]/g, "")}${smsBody}`;

    case "text":
    default:
      return content;
  }
};

/**
 * Get EasyQRCodeJS options from our options
 */
const getEasyQRCodeOptions = (
  content: string,
  options: Partial<QRGenerateOptions> = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Map error correction levels
  const correctLevelMap = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2,
  };

  const qrOptions: Record<string, unknown> = {
    text: content,
    width: opts.width,
    height: opts.width,
    colorDark: opts.foreground,
    colorLight: opts.background,
    correctLevel: correctLevelMap[opts.errorCorrectionLevel],
    quietZone: opts.quietZone,
    quietZoneColor: opts.background,
    dotScale: opts.dotScale,
  };

  // Position pattern colors
  if (opts.positionOuterColor) {
    qrOptions.PO = opts.positionOuterColor;
  }
  if (opts.positionInnerColor) {
    qrOptions.PI = opts.positionInnerColor;
  }

  // Logo
  if (opts.logoUrl) {
    qrOptions.logo = opts.logoUrl;
    qrOptions.logoWidth = opts.logoWidth;
    qrOptions.logoHeight = opts.logoHeight;
    qrOptions.logoBackgroundTransparent = opts.logoBackgroundTransparent;
  }

  return qrOptions;
};

/**
 * Generate QR code to a DOM element and get data URL
 */
export const generateQRCodeToElement = async (
  element: HTMLElement,
  content: string,
  options: Partial<QRGenerateOptions> = {}
): Promise<QRGenerateResult> => {
  if (!content.trim()) {
    return { success: false, error: "Content is required" };
  }

  // Dynamically import EasyQRCodeJS (client-side only)
  const QRCode = (await import("easyqrcodejs")).default;

  return new Promise((resolve) => {
    try {
      // Clear previous content
      element.innerHTML = "";

      const qrOptions = getEasyQRCodeOptions(content, options);

      // Add callback to get data URL
      qrOptions.onRenderingEnd = (_opts: unknown, dataURL: string | null) => {
        if (dataURL) {
          resolve({ success: true, dataUrl: dataURL });
        } else {
          resolve({ success: false, error: "Failed to generate QR code" });
        }
      };

      new QRCode(element, qrOptions);
    } catch (error) {
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate QR code",
      });
    }
  });
};

/**
 * Download QR code from element
 */
export const downloadQRCodeFromElement = async (
  element: HTMLElement,
  filename: string = "qrcode"
): Promise<boolean> => {
  try {
    const canvas = element.querySelector("canvas");
    if (!canvas) {
      return false;
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch {
    return false;
  }
};

/**
 * Detect content type from decoded QR data
 */
export const detectContentType = (data: string): QRContentType => {
  const lower = data.toLowerCase();

  if (lower.startsWith("wifi:")) return "wifi";
  if (lower.startsWith("mailto:")) return "email";
  if (lower.startsWith("tel:")) return "phone";
  if (lower.startsWith("sms:") || lower.startsWith("smsto:")) return "sms";
  if (/^https?:\/\//i.test(data) || /^www\./i.test(data)) return "url";

  return "text";
};

/**
 * Parse WiFi QR data
 */
export const parseWiFiData = (
  data: string
): { ssid: string; password: string; encryption: string; hidden: boolean } | null => {
  if (!data.toLowerCase().startsWith("wifi:")) return null;

  const params: Record<string, string> = {};
  const regex = /([TSPH]):([^;]*)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(data)) !== null) {
    params[match[1]] = match[2];
  }

  return {
    ssid: params.S || "",
    password: params.P || "",
    encryption: params.T || "WPA",
    hidden: params.H === "true",
  };
};

/**
 * Read QR code from image file
 */
export const readQRCodeFromFile = async (file: File): Promise<QRReadResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({ success: false, error: "Failed to create canvas context" });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          resolve({
            success: true,
            data: code.data,
            contentType: detectContentType(code.data),
          });
        } else {
          resolve({ success: false, error: "No QR code found in image" });
        }
      };

      img.onerror = () => {
        resolve({ success: false, error: "Failed to load image" });
      };

      img.src = reader.result as string;
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Failed to read file" });
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert file to data URL for logo
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Validate hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Preset color schemes for quick styling
 */
export const COLOR_PRESETS: {
  name: string;
  foreground: string;
  background: string;
  positionOuterColor: string;
  positionInnerColor: string;
}[] = [
  { name: "Classic", foreground: "#000000", background: "#ffffff", positionOuterColor: "#000000", positionInnerColor: "#000000" },
  { name: "Ocean", foreground: "#0066cc", background: "#e6f3ff", positionOuterColor: "#004499", positionInnerColor: "#003366" },
  { name: "Forest", foreground: "#228b22", background: "#f0fff0", positionOuterColor: "#006400", positionInnerColor: "#004d00" },
  { name: "Sunset", foreground: "#ff6b35", background: "#fff5f0", positionOuterColor: "#cc4400", positionInnerColor: "#993300" },
  { name: "Purple", foreground: "#7c3aed", background: "#f5f3ff", positionOuterColor: "#5b21b6", positionInnerColor: "#4c1d95" },
  { name: "Dark", foreground: "#ffffff", background: "#1a1a2e", positionOuterColor: "#e94560", positionInnerColor: "#e94560" },
  { name: "Neon", foreground: "#39ff14", background: "#0d0d0d", positionOuterColor: "#00ffff", positionInnerColor: "#ff00ff" },
  { name: "Rose", foreground: "#e11d48", background: "#fff1f2", positionOuterColor: "#be123c", positionInnerColor: "#9f1239" },
];
