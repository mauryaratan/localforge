// Favicon Maker utility functions
// Generates favicons in multiple sizes for all platforms

export type FaviconSize = {
  name: string;
  width: number;
  height: number;
  format: "png" | "ico";
  purpose?: string;
};

export type GeneratedFavicon = {
  name: string;
  width: number;
  height: number;
  blob: Blob;
  url: string;
  format: "png" | "ico";
};

export type FaviconResult = {
  favicons: GeneratedFavicon[];
  manifest: string;
  htmlCode: string;
};

// Standard favicon sizes for all platforms
export const FAVICON_SIZES: FaviconSize[] = [
  { name: "favicon-16x16.png", width: 16, height: 16, format: "png" },
  { name: "favicon-32x32.png", width: 32, height: 32, format: "png" },
  { name: "apple-touch-icon.png", width: 180, height: 180, format: "png", purpose: "Apple devices" },
  { name: "android-chrome-192x192.png", width: 192, height: 192, format: "png", purpose: "Android/PWA" },
  { name: "android-chrome-512x512.png", width: 512, height: 512, format: "png", purpose: "Android/PWA" },
  { name: "favicon.ico", width: 48, height: 48, format: "ico", purpose: "Legacy browsers" },
];

// ICO file header structure constants
const ICO_HEADER_SIZE = 6;
const ICO_ENTRY_SIZE = 16;

/**
 * Decode an image file into ImageData
 */
export const decodeImageFile = async (file: File): Promise<{
  imageData: ImageData;
  width: number;
  height: number;
}> => {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const imageData = ctx.getImageData(0, 0, width, height);
  return { imageData, width, height };
};

/**
 * Resize an image to target dimensions using canvas
 */
export const resizeImage = async (
  source: ImageBitmap | HTMLImageElement | HTMLCanvasElement,
  width: number,
  height: number
): Promise<HTMLCanvasElement> => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Failed to get canvas context");
  
  // Enable high-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  
  ctx.drawImage(source, 0, 0, width, height);
  return canvas;
};

/**
 * Convert canvas to PNG blob
 */
export const canvasToPngBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to convert canvas to PNG"));
      },
      "image/png",
      1.0
    );
  });
};

/**
 * Create ICO file from multiple PNG images
 * ICO format: Header + Directory Entries + Image Data
 */
export const createIcoBlob = async (pngBlobs: { size: number; blob: Blob }[]): Promise<Blob> => {
  // Sort by size descending for proper ICO structure
  const sorted = [...pngBlobs].sort((a, b) => b.size - a.size);
  const imageCount = sorted.length;
  
  // Read all PNG data
  const pngDataArray: Uint8Array[] = [];
  for (const { blob } of sorted) {
    const buffer = await blob.arrayBuffer();
    pngDataArray.push(new Uint8Array(buffer));
  }
  
  // Calculate total size
  const headerAndDirectorySize = ICO_HEADER_SIZE + (imageCount * ICO_ENTRY_SIZE);
  let totalPngSize = 0;
  for (const data of pngDataArray) {
    totalPngSize += data.length;
  }
  const totalSize = headerAndDirectorySize + totalPngSize;
  
  // Create ICO buffer
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const uint8 = new Uint8Array(buffer);
  
  // Write ICO header
  view.setUint16(0, 0, true);      // Reserved, must be 0
  view.setUint16(2, 1, true);      // Image type: 1 for ICO
  view.setUint16(4, imageCount, true); // Number of images
  
  // Write directory entries and image data
  let imageOffset = headerAndDirectorySize;
  
  for (let i = 0; i < imageCount; i++) {
    const size = sorted[i].size;
    const pngData = pngDataArray[i];
    const entryOffset = ICO_HEADER_SIZE + (i * ICO_ENTRY_SIZE);
    
    // ICO directory entry
    view.setUint8(entryOffset, size >= 256 ? 0 : size);       // Width (0 = 256)
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size);   // Height (0 = 256)
    view.setUint8(entryOffset + 2, 0);                         // Color palette (0 = no palette)
    view.setUint8(entryOffset + 3, 0);                         // Reserved
    view.setUint16(entryOffset + 4, 1, true);                  // Color planes
    view.setUint16(entryOffset + 6, 32, true);                 // Bits per pixel
    view.setUint32(entryOffset + 8, pngData.length, true);     // Image size
    view.setUint32(entryOffset + 12, imageOffset, true);       // Image offset
    
    // Write PNG data
    uint8.set(pngData, imageOffset);
    imageOffset += pngData.length;
  }
  
  return new Blob([buffer], { type: "image/x-icon" });
};

/**
 * Generate all favicon sizes from source image
 */
export const generateFavicons = async (file: File): Promise<FaviconResult> => {
  // Create image bitmap from file
  const bitmap = await createImageBitmap(file);
  const favicons: GeneratedFavicon[] = [];
  
  // Generate PNG favicons
  const pngSizes = FAVICON_SIZES.filter(s => s.format === "png");
  const icoSizes = [16, 32, 48]; // Sizes embedded in ICO
  
  for (const sizeConfig of pngSizes) {
    const canvas = await resizeImage(bitmap, sizeConfig.width, sizeConfig.height);
    const blob = await canvasToPngBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    favicons.push({
      name: sizeConfig.name,
      width: sizeConfig.width,
      height: sizeConfig.height,
      blob,
      url,
      format: "png",
    });
  }
  
  // Generate ICO file with multiple sizes
  const icoImages: { size: number; blob: Blob }[] = [];
  for (const size of icoSizes) {
    const canvas = await resizeImage(bitmap, size, size);
    const blob = await canvasToPngBlob(canvas);
    icoImages.push({ size, blob });
  }
  
  const icoBlob = await createIcoBlob(icoImages);
  const icoUrl = URL.createObjectURL(icoBlob);
  
  favicons.push({
    name: "favicon.ico",
    width: 48,
    height: 48,
    blob: icoBlob,
    url: icoUrl,
    format: "ico",
  });
  
  bitmap.close();
  
  // Generate manifest
  const manifest = generateManifest();
  
  // Generate HTML code
  const htmlCode = generateHtmlCode();
  
  return { favicons, manifest, htmlCode };
};

/**
 * Generate site.webmanifest content
 */
export const generateManifest = (name = "App", shortName = "App", themeColor = "#ffffff", backgroundColor = "#ffffff"): string => {
  const manifest = {
    name,
    short_name: shortName,
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: "standalone",
  };
  
  return JSON.stringify(manifest, null, 2);
};

/**
 * Generate HTML link tags for favicon installation
 */
export const generateHtmlCode = (): string => {
  return `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">`;
};

/**
 * Check if file type is supported
 */
export const isFileSupported = (file: File): boolean => {
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp", "image/gif"];
  return supportedTypes.includes(file.type);
};

/**
 * Format file size in human-readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exp);
  return `${value.toFixed(value >= 10 || value % 1 === 0 ? 0 : 1)} ${units[exp]}`;
};

/**
 * Clean up generated favicon URLs
 */
export const cleanupFavicons = (favicons: GeneratedFavicon[]): void => {
  for (const favicon of favicons) {
    URL.revokeObjectURL(favicon.url);
  }
};

/**
 * Convert file to base64 data URL for localStorage persistence
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert base64 data URL to File
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const [meta, data] = base64.split(",");
  const mimeMatch = meta.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/png";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new File([array], filename, { type: mime });
};
