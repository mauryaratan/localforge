/**
 * Generate PWA icons from SVG using Sharp
 * Run with: node scripts/generate-icons.mjs
 */

import { writeFileSync } from "fs";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// SVG template for the logo icon
const createSvg = (size) => {
  const padding = size * 0.15; // 15% padding
  const innerSize = size - padding * 2;
  const iconScale = innerSize / 32;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background for PWA -->
  <rect width="${size}" height="${size}" rx="${size * 0.125}" fill="#0a0a0a"/>
  
  <!-- Centered icon group -->
  <g transform="translate(${padding}, ${padding}) scale(${iconScale})">
    <!-- Background -->
    <rect
      x="2"
      y="4"
      width="28"
      height="24"
      rx="4"
      fill="#14b8a6"
      fill-opacity="0.2"
      stroke="#14b8a6"
      stroke-width="1.5"
    />
    <!-- Left bracket -->
    <path
      d="M8 10L12 16L8 22"
      stroke="#14b8a6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Underscore cursor -->
    <path
      d="M14 22H20"
      stroke="#14b8a6"
      stroke-width="2"
      stroke-linecap="round"
    />
    <!-- Privacy dot indicator -->
    <circle cx="24" cy="10" r="3" fill="#14b8a6"/>
  </g>
</svg>`;
};

// Create favicon SVG (smaller, simpler for clarity at small sizes)
const createFaviconSvg = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect
    x="2"
    y="4"
    width="28"
    height="24"
    rx="4"
    fill="#14b8a6"
    fill-opacity="0.2"
    stroke="#14b8a6"
    stroke-width="1.5"
  />
  <!-- Left bracket -->
  <path
    d="M8 10L12 16L8 22"
    stroke="#14b8a6"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <!-- Underscore cursor -->
  <path
    d="M14 22H20"
    stroke="#14b8a6"
    stroke-width="2"
    stroke-linecap="round"
  />
  <!-- Privacy dot indicator -->
  <circle cx="24" cy="10" r="3" fill="#14b8a6"/>
</svg>`;
};

async function generateIcons() {
  // PWA icon sizes
  const pwaSizes = [192, 512];

  for (const size of pwaSizes) {
    const svg = createSvg(size);
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const filename = `icon-${size}x${size}.png`;
    writeFileSync(join(publicDir, filename), pngBuffer);
    console.log(`✓ Generated ${filename}`);
  }

  // Generate favicon.ico (multi-size ICO file)
  const faviconSizes = [16, 32, 48];
  const faviconBuffers = await Promise.all(
    faviconSizes.map(async (size) => {
      const svg = createFaviconSvg(size);
      return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
    })
  );

  // For favicon, we'll generate a 32x32 PNG that Next.js will use
  // The actual favicon.ico is handled by app/icon.tsx
  const favicon32 = await sharp(Buffer.from(createFaviconSvg(32)))
    .resize(32, 32)
    .png()
    .toBuffer();
  writeFileSync(join(publicDir, "favicon-32x32.png"), favicon32);
  console.log("✓ Generated favicon-32x32.png");

  console.log("\n✅ All icons generated successfully!");
}

generateIcons().catch(console.error);
